import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateAddressDto } from "./create-address.dto";

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shortBio: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsArray()
  @IsString({ each: true })
  companies: string[];

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
