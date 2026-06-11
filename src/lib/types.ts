export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'checkbox';

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
};

export type RecordValue = string | number | boolean;

export type RecordItem = {
  id: string;
  [key: string]: RecordValue;
};

export type ModuleConfig = {
  id: string;
  title: string;
  short: string;
  icon: string;
  description: string;
  csvName: string;
  className: string;
  fields: Field[];
  seed?: Omit<RecordItem, 'id'>[];
};

export type Back4appConfig = {
  endpoint: string;
  appId: string;
  masterKey: string;
};

export type RepositoryMode = 'back4app' | 'localStorage';
