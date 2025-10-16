import { prisma } from "./prisma"
import { randomBytes } from "crypto"

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds

export async function createSession(
  userId: number,
  userAgent?: string,
  ipAddress?: string
) {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
    },
  })

  return session
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if session has expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Update last activity
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActivity: new Date() },
  })

  return session
}

export async function invalidateSession(token: string) {
  await prisma.session.delete({
    where: { token },
  }).catch(() => {
    // Session might not exist, ignore error
  })
}

export async function invalidateAllUserSessions(userId: number) {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

export async function getActiveSessions(userId: number) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      lastActivity: "desc",
    },
  })

  return sessions
}

export async function cleanupExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
