import { Component, inject } from '@angular/core';
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
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { CreatePost, PostService } from './data-access/post.services';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<div>
    <div style="margin-bottom: 20px">new post</div>
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
export default class NewPostComponent {
  #queryClient = injectQueryClient();
  #router = inject(Router);
  #postService = inject(PostService);
  data = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(6)]),
    content: new FormControl(''),
  });

  addPostMutation = injectMutation(() => ({
    mutationFn: (data: CreatePost) =>
      lastValueFrom(this.#postService.createPost(data)),
  }));

  onSubmit() {
    if (this.data.valid) {
      this.addPostMutation.mutate(
        {
          title: this.data.value.title ?? '',
          content: this.data.value.content ?? '',
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
