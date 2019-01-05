import {
  Component, OnInit, Input, OnChanges,
  SimpleChanges, ContentChild, TemplateRef,
  EventEmitter, Output, ViewEncapsulation
} from '@angular/core';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';
import { PaginatorConfig } from '@sq-ui/ng-sq-common/interfaces/paginator-config';

@Component({
  selector: 'sq-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() items = [];
  @Input() rowsPerPage: number = 10;
  @Input() sortByAllColumns: boolean = false;
  @Input() paginatorConfig: PaginatorConfig;
  @Input() sortByColumns: string[] = [];
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter<SortItem>();
  @Output() pageChange = new EventEmitter();

  @ContentChild(DatatableHeaderDirective, {read: TemplateRef}) datatableHeaderTemplate;
  @ContentChild(DatatableBodyDirective, {read: TemplateRef}) datatableBodyTemplate;

  columnNames: { name: string, canBeSortedAgainst: boolean }[] = [];
  paginatedCollection = [];

  constructor() { }

  ngOnInit() {

  }

  onPageChange($event) {
    this.pageChange.emit($event);
  }

  ngOnChanges(changesObj: SimpleChanges) {
    if (changesObj.items && changesObj.items.currentValue.length > 0) {
      this.generateColumns(changesObj.items.currentValue[0]);
    }

    if (changesObj.sortByColumns && changesObj.sortByColumns.currentValue.length > 0) {
      this.generateColumns(this.items);
    }

    if (changesObj.sortByAllColumns && changesObj.sortByAllColumns.currentValue === true) {
      this.generateColumns(this.items);
    }
  }

  sortByField(column: SortItem) {
    if (this.onSortClicked.observers.length > 0) {
      this.onSortClicked.emit(column);
    } else {
      this.sortItems(column.name, column.isSortedByAscending);
    }
  }

  private sortItems(columnName: string, ascending: boolean) {
    this.paginatedCollection.sort((rowItem1, rowItem2) => {
      if (rowItem1[columnName] > rowItem2[columnName]) {
        return ascending ? 1 : -1;
      }

      if (rowItem1[columnName] < rowItem2[columnName]) {
        return ascending ? -1 : 1;
      }

      // names must be equal
      return 0;
    });
  }

  private generateColumns(item) {
    this.columnNames = Object.keys(item)
      .map((columnName) => {
        let canBeSortedAgainst = this.sortByAllColumns ||
          (this.sortByColumns && this.sortByColumns.indexOf(columnName) > -1);

        return {
          name: columnName,
          canBeSortedAgainst: canBeSortedAgainst
        };
      });
  }
}
