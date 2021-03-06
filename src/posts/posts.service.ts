import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/users/entities/user.entity';
import { FindManyOptions, In, MoreThan, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import Post from './entity/post.entity';
import PostEntity from './entity/post.entity';
import PostNotFoundException from './exception/postNotFund.exception';
import PostsSearchService from './postsSearch.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private postsSearchService: PostsSearchService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User) {
    const newPost = await this.postsRepository.create({
      ...createPostDto,
      author: user,
    });
    await this.postsRepository.save(newPost);
    this.postsSearchService.indexPost(newPost);
    return newPost;
  }

  async findAll(offset?: number, limit?: number, startId?: number) {
    const where: FindManyOptions<Post>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.postsRepository.count();
    }
    const [items, count] = await this.postsRepository.findAndCount({
      where,
      relations: ['author'],
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne(id, {
      relations: ['author', 'categories'],
    });
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }

  async searchForPosts(
    text: string,
    offset?: number,
    limit?: number,
    startId?: number,
  ) {
    const { results, count } = await this.postsSearchService.search(
      text,
      offset,
      limit,
      startId,
    );
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return {
        items: [] as any[],
        count,
      };
    }
    const items = await this.postsRepository.find({
      where: { id: In(ids) },
    });
    return {
      items,
      count,
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.postsRepository.update(id, updatePostDto);
    const updatedPost = await this.postsRepository.findOne(id, {
      relations: ['author', 'categories'],
    });
    if (updatedPost) {
      await this.postsSearchService.update(updatedPost);
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async remove(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
  }
  async getPostsWithParagraph(paragraph: string) {
    return this.postsRepository.query(
      'SELECT * from post WHERE $1 = ANY(paragraphs)',
      [paragraph],
    );
  }
}
