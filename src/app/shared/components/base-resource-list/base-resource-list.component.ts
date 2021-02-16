import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { OnInit } from '@angular/core';
import { BaseResourceModel } from '../../models/base-resource.model';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(protected resourceService: BaseResourceService<T>) { }

  ngOnInit() {
    this.resourceService.getAll().subscribe(
      resources => this.resources = resources.sort((a, b) => b.id - a.id),
      () => alert('Erro ao carregar a lista')
    );
  }

  deleteResource(resource) {
    const mustDelete = confirm('Deseja realmente excluir este item?');

    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(
          element => element !== resource
        ),
        () => alert('Erro ao tentar excluir')
      );
    }
  }

}
