import { WordEntry } from '../model/WordEntry';
import { WordRepository } from '../../domain/repository/WordRepository';

export class DefaultWordRepository implements WordRepository {
  constructor(private words: WordEntry[]) {}

  getWords(): WordEntry[] {
    return this.words;
  }
}