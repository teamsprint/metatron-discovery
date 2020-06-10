import {Injectable} from '@angular/core';
import {RecipeModule} from '../recipe.module';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: RecipeModule
})
export class RecipeService {

  constructor(private readonly http: HttpClient) {
  }
}
