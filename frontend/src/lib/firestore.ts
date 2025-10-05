import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// User interface (simplified for college project)
export interface User {
  id: string
  name: string
  email: string
  createdAt: Timestamp
}

// Project interface
export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Documentation History interface
export interface DocumentationHistory {
  id: string
  userId: string
  projectId?: string
  originalCode: string
  generatedDocumentation: string
  language: string
  aiModel: string
  createdAt: Timestamp
}

// Simple usage tracking for college project
export interface UserUsage {
  id: string
  userId: string
  language: string
  createdAt: Timestamp
}

// User Service
export class UserService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    const now = Timestamp.now()
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: now
    })
    return userRef.id
  }

  static async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User
    }
    return null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return { id: userDoc.id, ...userDoc.data() } as User
    }
    return null
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, updates)
  }
}

// Project Service
export class ProjectService {
  static async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now()
    const projectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: now,
      updatedAt: now
    })
    return projectRef.id
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[]
  }

  static async getProject(projectId: string): Promise<Project | null> {
    const projectDoc = await getDoc(doc(db, 'projects', projectId))
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() } as Project
    }
    return null
  }
}

// Documentation History Service
export class DocumentationService {
  static async saveDocumentation(docData: Omit<DocumentationHistory, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'documentationHistory'), {
      ...docData,
      createdAt: Timestamp.now()
    })
    return docRef.id
  }

  static async getUserDocumentation(userId: string, limitCount: number = 10): Promise<DocumentationHistory[]> {
    const q = query(
      collection(db, 'documentationHistory'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocumentationHistory[]
  }

  static async getProjectDocumentation(projectId: string): Promise<DocumentationHistory[]> {
    const q = query(
      collection(db, 'documentationHistory'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocumentationHistory[]
  }
}

// Simplified Usage Service for college project
export class UsageService {
  static async trackUsage(usageData: Omit<UserUsage, 'id' | 'createdAt'>) {
    const usageRef = await addDoc(collection(db, 'userUsage'), {
      ...usageData,
      createdAt: Timestamp.now()
    })
    return usageRef.id
  }

  static async getUserUsage(userId: string): Promise<UserUsage[]> {
    const q = query(
      collection(db, 'userUsage'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserUsage[]
  }

  static async getUsageStats(userId: string) {
    const usage = await this.getUserUsage(userId)
    
    const totalDocumentations = usage.length
    
    const languageUsage = usage.reduce((acc, u) => {
      acc[u.language] = (acc[u.language] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    return {
      totalDocumentations,
      languages: languageUsage
    }
  }
}
