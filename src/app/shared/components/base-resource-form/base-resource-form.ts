import { Injector } from '@angular/core';
import { OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel>
  implements OnInit, AfterContentChecked  {

  currentyAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: Array<any>) => T
  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrencyAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentyAction === 'new')
      this.createResource();
    else
      this.updateResource();
  }

  // PRIVATE METHOD

  protected setCurrencyAction() {
    if (this.route.snapshot.url[0].path == 'new')
      this.currentyAction = 'new';
    else
      this.currentyAction = 'edit';
  }

  protected loadResource() {
    if (this.currentyAction === 'edit')
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      )
      .subscribe(
        category => {
          this.resource = category;
          this.resourceForm.patchValue(category) // binds loaded category data to CategoryForm
        },
        error => alert('Ocorreu um erro no servidor, tente mais tarde.')
      );
  }

  protected setPageTitle() {
    if (this.currentyAction === 'new')
      this.pageTitle = this.creationPageTitle();
    else
      this.pageTitle = this.editionPageTitle();
  }

  protected creationPageTitle(): string{
    return 'Novo';
  }

  protected editionPageTitle(): string{
    return 'Edição';
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.update(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected actionsForSuccess(resource: T) {
    const baseComponetPath: string = this.route.snapshot.parent.url[0].path;

    toastr.success('Solicitação processada com sucesso');

    this.router.navigateByUrl(baseComponetPath, { skipLocationChange: true }).then(
      () => this.router.navigate([baseComponetPath, resource.id, "edit"])
    );

  }

  protected actionsForError(error) {
    toastr.error('Ocorreu um erro ao processar a sua solicitação');

    this.submittingForm = false;

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"];
  }

  protected abstract buildResourceForm(): void;

}
