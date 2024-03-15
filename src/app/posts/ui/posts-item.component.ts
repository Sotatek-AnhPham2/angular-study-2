import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../data-access/post.services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [RouterLink],
  template: `<div>
    <a routerLink="/posts/{{ post.id }}">{{ post.title }}</a>
    <button (click)="delete.emit(post.id)">Delete</button>
    <button (click)="edit.emit(post.id)">Edit</button>
  </div>`,
})
export class PostItemComponent {
  @Input({ required: true }) post!: Post;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
}
