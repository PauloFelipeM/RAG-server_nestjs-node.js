import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { SearchClientDto } from "./dto/search-client.dto";
import { ApiKeyGuard } from "../common/guards/api-key.guard";

@Controller("clients")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get("search")
  search(@Query() searchDto: SearchClientDto) {
    return this.clientService.search(searchDto.query, searchDto.limit ?? 5);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Delete(":id")
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id") id: string) {
    return this.clientService.delete(id);
  }
}
