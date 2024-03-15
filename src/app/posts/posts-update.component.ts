import { Component, Input, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { CreatePost, PostService } from './data-access/post.services';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<div>
    <div style="margin-bottom: 20px">Update post</div>
    <form [formGroup]="data" (ngSubmit)="onSubmit()" #form="ngForm">
      <div>
        <input type="text" formControlName="title" />
        @if(!data.controls.title.valid && form.submitted){
        <p style="margin:0; font-size: 14px">Title is required</p>
        }
      </div>

      <div>
        <input type="text" formControlName="content" />
      </div>

      <button type="submit">Submit</button>
    </form>
  </div>`,
})
export default class UpdatePostComponent {
  @Input() postId: string = '';

  #queryClient = injectQueryClient();
  #router = inject(Router);
  #postService = inject(PostService);
  data = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(6)]),
    content: new FormControl(''),
  });

  postQ = injectQuery(() => ({
    queryKey: ['PostService', 'getPostById', this.postId],
    queryFn: async () =>
      lastValueFrom(this.#postService.getPostById(String(this.postId)))
        .then((res) => {
          this.data.patchValue({
            title: res.title,
            content: res.content,
          });
          return res;
        })
        .catch((error) => {
          console.log(error);
        }),
  }));

  updatePostMutation = injectMutation(() => ({
    mutationFn: (payload: { id: string; data: CreatePost }) =>
      lastValueFrom(this.#postService.updatePost(payload)),
  }));

  onSubmit() {
    if (this.data.valid) {
      this.updatePostMutation.mutate(
        {
          id: this.postId,
          data: {
            title: this.data.value.title ?? '',
            content: this.data.value.content ?? '',
          },
        },
        {
          onSuccess: async () => {
            this.#queryClient.removeQueries({ queryKey: ['PostService'] });
            this.#router.navigate(['/posts']);
          },
        }
      );
    }
  }
}
