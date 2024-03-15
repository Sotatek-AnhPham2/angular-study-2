import { Component, inject, signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { PostService } from './data-access/post.services';
import { fromEvent, lastValueFrom, takeUntil } from 'rxjs';
import { PostItemComponent } from './ui/posts-item.component';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [PostItemComponent, RouterModule, RouterLink],
  template: `<div>
    <div style="margin-bottom: 20px">
      <a routerLink="/posts/new">New Post</a>
    </div>
    <p>posts works!</p>
    <div>
      <div>
        @switch (postsQ.status()) { @case ('pending') { Loading... } @case
        ('error') { Fail To Load } @case ('success') {
        <ul>
          @for (post of postsQ.data(); track post.id) {
          <app-post-item
            [post]="post"
            (delete)="handleDelete($event)"
            (edit)="handleEdit($event)"
          />
          } @empty { No Post }
        </ul>
        } }
      </div>
    </div>
  </div>`,
})
export default class PostsComponent {
  q = signal('');

  #postService = inject(PostService);
  #queryClient = injectQueryClient();
  #router = inject(Router);

  postsQ = injectQuery(() => ({
    queryKey: ['PostService', 'getPosts', this.q()],
    queryFn: (context) => {
      const abort$ = fromEvent(context.signal, 'abort');
      return lastValueFrom(
        this.#postService.getPosts({ q: this.q() }).pipe(takeUntil(abort$))
      );
    },
  }));

  deletePostMutation = injectMutation(() => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.#postService.deletePost(String(id))),
  }));

  handleDelete(id: number) {
    console.log(id);
    this.deletePostMutation.mutate(id, {
      onSuccess: () => {
        return this.#queryClient.invalidateQueries({
          queryKey: ['PostService'],
        });
      },
    });
  }

  handleEdit(id: number) {
    console.log(id);
    this.#router.navigate([`/posts/update/${id}`]);
  }
}
