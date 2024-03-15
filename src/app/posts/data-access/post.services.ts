import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Post {
  content?: string;
  id: number;
  published?: boolean;
  title: string;
}

export interface CreatePost extends Omit<Post, 'id'> {}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  getPosts(params: { q?: string } = {}) {
    return this.http.get<Post[]>('posts', { params });
  }

  createPost(data: CreatePost) {
    return this.http.post('posts', data);
  }

  deletePost(id: string) {
    return this.http.delete(`posts/${id}`);
  }

  getPostById(id: string) {
    return this.http.get<Post>(`posts/${id}`);
  }

  updatePost(payload: { id: string; data: CreatePost }) {
    return this.http.put(`posts/${payload.id}`, payload.data);
  }
}
