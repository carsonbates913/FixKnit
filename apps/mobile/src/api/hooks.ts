import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { ImagePickerAsset } from 'expo-image-picker'

import { photoFormData } from '@/lib/upload'

import { api, unwrap } from './client'
import type {
  BodyCreateDiagnosis,
  BodyUploadMedia,
  PostCreate,
  PostOut,
  PostPage,
  ProfileIn,
  ProjectOut,
  ProjectPatch,
  ProjectUpdateIn,
} from './schema'

export const keys = {
  me: ['me'] as const,
  feed: (author?: string) => ['posts', author ?? 'all'] as const,
  post: (id: string) => ['post', id] as const,
  profile: (handle: string) => ['profile', handle] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
}

// ---------------------------------------------------------------- profile
export function useSaveProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProfileIn) => unwrap(api.PUT('/api/me/profile', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.me }),
  })
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: () => unwrap(api.DELETE('/api/me')) })
}

export function useProfile(handle: string) {
  return useQuery({
    queryKey: keys.profile(handle),
    queryFn: () => unwrap(api.GET('/api/profiles/{handle}', { params: { path: { handle } } })),
  })
}

// ---------------------------------------------------------------- posts
export function useFeed(author?: string) {
  return useInfiniteQuery({
    queryKey: keys.feed(author),
    queryFn: ({ pageParam }) =>
      unwrap(api.GET('/api/posts', { params: { query: { author, cursor: pageParam, limit: 12 } } })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: keys.post(id),
    queryFn: () => unwrap(api.GET('/api/posts/{post_id}', { params: { path: { post_id: id } } })),
  })
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const form = await photoFormData(asset)
      return unwrap(
        api.POST('/api/media', {
          // Generated types model the upload as a string; the real payload is the FormData.
          body: {} as BodyUploadMedia,
          bodySerializer: () => form,
        }),
      )
    },
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PostCreate) => unwrap(api.POST('/api/posts', { body })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: keys.me })
    },
  })
}

/** Like or unlike with an optimistic update across every cached feed and the post itself. */
export function useToggleLike() {
  const qc = useQueryClient()
  const patch = (post: PostOut, liked: boolean): PostOut =>
    post.liked_by_me === liked ? post : { ...post, liked_by_me: liked, like_count: post.like_count + (liked ? 1 : -1) }

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      unwrap(liked ? api.PUT('/api/posts/{post_id}/like', { params: { path: { post_id: id } } }) : api.DELETE('/api/posts/{post_id}/like', { params: { path: { post_id: id } } })),
    onMutate: ({ id, liked }) => {
      qc.setQueriesData<InfiniteData<PostPage>>({ queryKey: ['posts'] }, (data) =>
        data && { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? patch(it, liked) : it)) })) },
      )
      qc.setQueryData<PostOut>(keys.post(id), (post) => post && patch(post, liked))
    },
    onError: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

// ---------------------------------------------------------------- diagnoses & projects
export function useDiagnose() {
  return useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const form = await photoFormData(asset)
      return unwrap(api.POST('/api/diagnoses', { body: {} as BodyCreateDiagnosis, bodySerializer: () => form }))
    },
  })
}

export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: () => unwrap(api.GET('/api/projects')) })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: keys.project(id),
    queryFn: () => unwrap(api.GET('/api/projects/{project_id}', { params: { path: { project_id: id } } })),
  })
}

export function useStartProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { diagnosis_id: string; option_id: string }) => unwrap(api.POST('/api/projects', { body })),
    onSuccess: (project) => {
      qc.setQueryData(keys.project(project.id), project)
      qc.invalidateQueries({ queryKey: keys.projects })
    },
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  const settle = (project: ProjectOut) => {
    qc.setQueryData(keys.project(id), project)
    qc.invalidateQueries({ queryKey: keys.projects })
  }
  const path = { params: { path: { project_id: id } } }
  return {
    patch: useMutation({ mutationFn: (body: ProjectPatch) => unwrap(api.PATCH('/api/projects/{project_id}', { ...path, body })), onSuccess: settle }),
    addUpdate: useMutation({ mutationFn: (body: ProjectUpdateIn) => unwrap(api.POST('/api/projects/{project_id}/updates', { ...path, body })), onSuccess: settle }),
    publish: useMutation({
      mutationFn: (caption: string) => unwrap(api.POST('/api/projects/{project_id}/publish', { ...path, body: { caption } })),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: keys.project(id) })
        qc.invalidateQueries({ queryKey: ['posts'] })
      },
    }),
  }
}
