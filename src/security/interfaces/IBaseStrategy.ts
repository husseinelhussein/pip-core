import { Strategy } from 'passport-strategy';
export interface IBaseStrategy {
    getStrategy(): Strategy
}