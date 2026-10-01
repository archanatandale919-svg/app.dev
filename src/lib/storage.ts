import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { StudyProblem, ConceptNote, UserProfile } from './types';

const LOCAL_PROBLEMS_KEY = 'omnistudy_local_problems';
const LOCAL_CONCEPTS_KEY = 'omnistudy_local_concepts';
const LOCAL_PROFILE_KEY = 'omnistudy_local_profile';

// Helper for local storage
export function getLocalProblems(): StudyProblem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROBLEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalProblem(problem: StudyProblem) {
  try {
    const items = getLocalProblems();
    const existingIndex = items.findIndex(p => p.id === problem.id);
    if (existingIndex >= 0) {
      items[existingIndex] = problem;
    } else {
      items.unshift(problem);
    }
    localStorage.setItem(LOCAL_PROBLEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving local problem', e);
  }
}

export function deleteLocalProblem(problemId: string) {
  try {
    const items = getLocalProblems().filter(p => p.id !== problemId);
    localStorage.setItem(LOCAL_PROBLEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed deleting local problem', e);
  }
}

export function getLocalConcepts(): ConceptNote[] {
  try {
    const raw = localStorage.getItem(LOCAL_CONCEPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalConcept(concept: ConceptNote) {
  try {
    const items = getLocalConcepts();
    const existingIndex = items.findIndex(c => c.id === concept.id);
    if (existingIndex >= 0) {
      items[existingIndex] = concept;
    } else {
      items.unshift(concept);
    }
    localStorage.setItem(LOCAL_CONCEPTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving local concept', e);
  }
}

export function deleteLocalConcept(conceptId: string) {
  try {
    const items = getLocalConcepts().filter(c => c.id !== conceptId);
    localStorage.setItem(LOCAL_CONCEPTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed deleting local concept', e);
  }
}

export function getLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile) {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed saving local profile', e);
  }
}

// ----------------------------------------------------
// Cloud Firestore operations with strict error reporting
// ----------------------------------------------------

export async function saveStudyProblemToCloud(problem: StudyProblem): Promise<void> {
  const path = `problems/${problem.id}`;
  try {
    // Save to Firestore
    await setDoc(doc(db, 'problems', problem.id), {
      ...problem,
      updatedAt: new Date().toISOString()
    });
    // Also update local cache for instant offline responsiveness
    saveLocalProblem(problem);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserStudyProblemsFromCloud(userId: string): Promise<StudyProblem[]> {
  const path = 'problems';
  try {
    const q = query(
      collection(db, 'problems'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const problems: StudyProblem[] = [];
    snapshot.forEach(docSnap => {
      problems.push(docSnap.data() as StudyProblem);
    });
    // Sort descending by createdAt
    problems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return problems;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteStudyProblemFromCloud(problemId: string): Promise<void> {
  const path = `problems/${problemId}`;
  try {
    await deleteDoc(doc(db, 'problems', problemId));
    deleteLocalProblem(problemId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveConceptNoteToCloud(concept: ConceptNote): Promise<void> {
  const path = `concepts/${concept.id}`;
  try {
    await setDoc(doc(db, 'concepts', concept.id), {
      ...concept,
      updatedAt: new Date().toISOString()
    });
    saveLocalConcept(concept);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserConceptsFromCloud(userId: string): Promise<ConceptNote[]> {
  const path = 'concepts';
  try {
    const q = query(
      collection(db, 'concepts'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const concepts: ConceptNote[] = [];
    snapshot.forEach(docSnap => {
      concepts.push(docSnap.data() as ConceptNote);
    });
    concepts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return concepts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteConceptNoteFromCloud(conceptId: string): Promise<void> {
  const path = `concepts/${conceptId}`;
  try {
    await deleteDoc(doc(db, 'concepts', conceptId));
    deleteLocalConcept(conceptId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveUserProfileToCloud(profile: UserProfile): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    await setDoc(doc(db, 'users', profile.userId), {
      ...profile,
      updatedAt: new Date().toISOString()
    });
    saveLocalProfile(profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserProfileFromCloud(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
