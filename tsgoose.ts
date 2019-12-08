import { Types, Schema, SchemaTypeOpts } from 'mongoose';

// schema variables
export type Id = '_id';
export type VerOption = 'versionKey';
export type VerKey = '__v';
export type Timestamps = 'timestamps';
export type CreatedAt = 'createdAt';
export type UpdatedAt = 'updatedAt';

// type option variables
export type Required = 'required';
export type NotRequired = 'notRequired';
export type Select = 'select';
export type Enum = 'enum';
export type Type = 'type';

// subDocument
export interface SubDocumentNoId extends Omit<Types.Subdocument, Id> { }
export interface SubDocument extends Types.Subdocument { }

// 可选参数
export type OptionalKeys<T> = {
    [K in keyof T]: T[K] extends Record<Required, true> ? never : K
}[keyof T];

// 必选参数
export type RequiredKeys<T> = {
    [K in keyof T]: T[K] extends Record<Required, true> ? K : never
}[keyof T];

type BaseTypes = StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    | Types.ObjectId
    | Types.Decimal128
    | (typeof Buffer)
    | (typeof Schema.Types.Mixed);

type BaseTypeOptions = Partial<
    Record<Required, boolean> & Record<Select, boolean>
>
    | BaseTypes
    | { type?: BaseTypes | BaseTypes[] };


export type TypeOptions = BaseTypeOptions | Array<BaseTypeOptions>;

// 提取type字段
export type ExtractType<T> = T extends Record<Type, infer O> ? O : T;

type _ConvertType<T> = T extends NumberConstructor ? number
    : T extends StringConstructor ? string
    : T extends BooleanConstructor ? boolean
    : T extends DateConstructor ? Date
    : T extends (typeof Buffer) ? Buffer
    : T extends (typeof Schema.Types.ObjectId) ? Types.ObjectId
    : T extends (typeof Schema.Types.Decimal128) ? Types.Decimal128
    : T extends (typeof Schema.Types.Mixed) ? any
    : T;

export type ConvertType<T> = T extends Array<infer O> ? Array<_ConvertType<O>> : _ConvertType<T>;
export type ConvertSchemaType<T> = ConvertType<ExtractType<T>>;

// 转换keys
export type ConvertSchema<T> = {
    [K in OptionalKeys<T>]?: T[K] extends Array<infer O> ? Array<ConvertSchemaType<O>> : ConvertSchemaType<T[K]> }
    & { [K in RequiredKeys<T>]: T[K] extends Array<infer O> ? Array<ConvertSchemaType<O>> : ConvertSchemaType<T[K]> }

export function t<T extends { [k: string]: TypeOptions }>(schemaDefine: T): ConvertSchema<T> {
    return schemaDefine as any;
}