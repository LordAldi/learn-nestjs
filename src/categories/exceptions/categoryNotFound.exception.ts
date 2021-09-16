import { NotFoundException } from '@nestjs/common/exceptions';

class CategoryNotFoundException extends NotFoundException {
  constructor(postId: number) {
    super(`Category with id ${postId} not found`);
  }
}

export default CategoryNotFoundException;
