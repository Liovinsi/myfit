import fs from 'fs'
import path from 'path'
import Profile from '../models/Profile.js'
import { uploadsDir } from '../utils/uploadStorage.js'

async function getOrCreateProfile() {
  let profile = await Profile.findOne()

  if (!profile) {
    profile = await Profile.create({ name: 'Vidya' })
  }

  return profile
}

export async function getProfile(_req, res, next) {
  try {
    res.json(await getOrCreateProfile())
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await getOrCreateProfile()

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      profile.name = req.body.name.trim()
    }

    await profile.save()
    res.json(profile)
  } catch (error) {
    next(error)
  }
}

export async function uploadProfileImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'An image file is required' })
    }

    const profile = await getOrCreateProfile()
    const previousImageUrl = profile.imageUrl

    profile.imageUrl = `/uploads/${req.file.filename}`
    await profile.save()

    if (previousImageUrl && previousImageUrl.startsWith('/uploads/')) {
      const previousPath = path.join(uploadsDir, path.basename(previousImageUrl))
      fs.unlink(previousPath, () => {})
    }

    res.json(profile)
  } catch (error) {
    next(error)
  }
}
