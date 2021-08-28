import { AndOperator, OrOperator,  WhereAttributeHash } from 'sequelize';
import { Literal, Where } from 'sequelize/types/lib/utils';

declare global{
  namespace sequelize {
    // export interface Filterable {
    //   /**
    //    * Attribute has to be matched for rows to be selected for the given action.
    //    */
    //   where?: WhereOptions;
    // }

    /**
     * The type accepted by every `where` option
     */
    export type WhereOptions = WhereAttributeHash | AndOperator | OrOperator | Literal | Where;
  }
}