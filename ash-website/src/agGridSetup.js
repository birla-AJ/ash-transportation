import { ClientSideRowModelModule, CsvExportModule, ModuleRegistry } from 'ag-grid-community';
import {
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  LicenseManager,
  MenuModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MenuModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
]);

const licenseKey = process.env.REACT_APP_AG_GRID_LICENSE_KEY;
if (licenseKey) {
  LicenseManager.setLicenseKey(licenseKey);
}
