import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';

import { CategoryService } from './../shared/category.service';
import { Category } from './../shared/category.model';
import { BaseResourceFormComponent } from 'src/app/shared/components/base-resource-form/base-resource-form';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent extends BaseResourceFormComponent<Category>{

  constructor(protected categoryService: CategoryService, protected injector: Injector){
    super(injector, new Category(), categoryService, Category.fromJson);
  }

  // PRIVATE METHOD

  protected buildResourceForm() {
    this.resourceForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  protected creationPageTitle() {
    return "Cadastro de nova Categoria";
  }

  protected editionPageTitle() {
    const categoryName = this.resource.name || "";
    return "Editando Categoria: " + categoryName;
  }
}
