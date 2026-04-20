import { WordEntry } from '../../data/model/WordEntry';

export interface WordRepository {
  getWords(): WordEntry[];
}