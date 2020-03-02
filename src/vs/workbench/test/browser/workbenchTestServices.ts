/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/workbench/contrib/files/browser/files.contribution'; // load our contribution into the test
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import * as resources from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { NullTelemetryService } from 'vs/platform/telemetry/common/telemetryUtils';
import { IEditorInputWithOptions, CloseDirection, IEditorIdentifier, IUntitledTextResourceInput, IResourceDiffInput, IResourceSideBySideInput, IEditorInput, IEditor, IEditorCloseEvent, IEditorPartOptions, IRevertOptions, GroupIdentifier, EditorInput, EditorOptions, EditorsOrder, IFileEditorInput, IEditorInputFactoryRegistry, IEditorInputFactory, Extensions as EditorExtensions, ISaveOptions, IMoveResult, ITextEditor, ITextDiffEditor, ITextSideBySideEditor } from 'vs/workbench/common/editor';
import { IEditorOpeningEvent, EditorServiceImpl, IEditorGroupView, IEditorGroupsAccessor } from 'vs/workbench/browser/parts/editor/editor';
import { Event, Emitter } from 'vs/base/common/event';
import { IBackupFileService, IResolvedBackup } from 'vs/workbench/services/backup/common/backup';
import { IConfigurationService, ConfigurationTarget } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService, Parts, Position as PartPosition } from 'vs/workbench/services/layout/browser/layoutService';
import { TextModelResolverService } from 'vs/workbench/services/textmodelResolver/common/textModelResolverService';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorOptions, IResourceInput, IEditorModel, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IUntitledTextEditorService, UntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILifecycleService, BeforeShutdownEvent, ShutdownReason, StartupKind, LifecyclePhase, WillShutdownEvent } from 'vs/platform/lifecycle/common/lifecycle';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { FileOperationEvent, IFileService, IFileStat, IResolveFileResult, FileChangesEvent, IResolveFileOptions, ICreateFileOptions, IFileSystemProvider, FileSystemProviderCapabilities, IFileChange, IWatchOptions, IStat, FileType, FileDeleteOptions, FileOverwriteOptions, FileWriteOptions, FileOpenOptions, IFileStatWithMetadata, IResolveMetadataFileOptions, IWriteFileOptions, IReadFileOptions, IFileContent, IFileStreamContent, FileOperationError } from 'vs/platform/files/common/files';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ModeServiceImpl } from 'vs/editor/common/services/modeServiceImpl';
import { ModelServiceImpl } from 'vs/editor/common/services/modelServiceImpl';
import { IResourceEncoding, ITextFileService, IReadTextFileOptions, ITextFileStreamContent } from 'vs/workbench/services/textfile/common/textfiles';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IInstantiationService, ServicesAccessor, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { MenuBarVisibility, IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions } from 'vs/platform/windows/common/windows';
import { TestWorkspace } from 'vs/platform/workspace/test/common/testWorkspace';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { ITextResourceConfigurationService, ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfigurationService';
import { IPosition, Position as EditorPosition } from 'vs/editor/common/core/position';
import { IMenuService, MenuId, IMenu } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { MockContextKeyService, MockKeybindingService } from 'vs/platform/keybinding/test/common/mockKeybindingService';
import { ITextBufferFactory, DefaultEndOfLine, EndOfLinePreference, ITextSnapshot } from 'vs/editor/common/model';
import { Range } from 'vs/editor/common/core/range';
import { IDialogService, IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, IFileDialogService, ConfirmResult } from 'vs/platform/dialogs/common/dialogs';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TestNotificationService } from 'vs/platform/notification/test/common/testNotificationService';
import { IExtensionService, NullExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IDecorationsService, IResourceDecorationChangeEvent, IDecoration, IDecorationData, IDecorationsProvider } from 'vs/workbench/services/decorations/browser/decorations';
import { IDisposable, toDisposable, Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IEditorGroupsService, IEditorGroup, GroupsOrder, GroupsArrangement, GroupDirection, IAddGroupOptions, IMergeGroupOptions, IMoveEditorOptions, ICopyEditorOptions, IEditorReplacement, IGroupChangeEvent, IFindGroupScope, EditorGroupLayout, ICloseEditorOptions, GroupOrientation } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService, IOpenEditorOverrideHandler, IVisibleEditor, ISaveEditorsOptions, IRevertAllEditorsOptions, IResourceEditor, SIDE_GROUP_TYPE, ACTIVE_GROUP_TYPE } from 'vs/workbench/services/editor/common/editorService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorRegistry, EditorDescriptor, Extensions } from 'vs/workbench/browser/editor';
import { EditorGroup } from 'vs/workbench/common/editor/editorGroup';
import { Dimension } from 'vs/base/browser/dom';
import { ILogService, NullLogService } from 'vs/platform/log/common/log';
import { ILabelService } from 'vs/platform/label/common/label';
import { timeout } from 'vs/base/common/async';
import { IViewletService } from 'vs/workbench/services/viewlet/browser/viewlet';
import { ViewletDescriptor, Viewlet } from 'vs/workbench/browser/viewlet';
import { IViewlet } from 'vs/workbench/common/viewlet';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { isLinux } from 'vs/base/common/platform';
import { LabelService } from 'vs/workbench/services/label/common/labelService';
import { IDimension } from 'vs/platform/layout/browser/layoutService';
import { Part } from 'vs/workbench/browser/part';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { IPanel } from 'vs/workbench/common/panel';
import { IBadge } from 'vs/workbench/services/activity/common/activity';
import { VSBuffer, VSBufferReadable } from 'vs/base/common/buffer';
import { Schemas } from 'vs/base/common/network';
import { IProductService } from 'vs/platform/product/common/productService';
import product from 'vs/platform/product/common/product';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { find } from 'vs/base/common/arrays';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IFilesConfigurationService, FilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IAccessibilityService, AccessibilitySupport } from 'vs/platform/accessibility/common/accessibility';
import { BrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { BrowserTextFileService } from 'vs/workbench/services/textfile/browser/browserTextFileService';
import * as CommonWorkbenchTestServices from 'vs/workbench/test/common/workbenchTestServices';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { createTextBufferFactoryFromStream } from 'vs/editor/common/model/textModel';
import { IRemotePathService } from 'vs/workbench/services/path/common/remotePathService';
import { Direction } from 'vs/base/browser/ui/grid/grid';
import { IProgressService, IProgressOptions, IProgressWindowOptions, IProgressNotificationOptions, IProgressCompositeOptions, IProgress, IProgressStep, Progress } from 'vs/platform/progress/common/progress';
import { IWorkingCopyFileService, WorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { UndoRedoService } from 'vs/platform/undoRedo/common/undoRedoService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { TextFileEditorModel } from 'vs/workbench/services/textfile/common/textFileEditorModel';
import { Registry } from 'vs/platform/registry/common/platform';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { TestDialogService } from 'vs/platform/dialogs/test/common/testDialogService';
import { CodeEditorService } from 'vs/workbench/services/editor/browser/codeEditorService';
import { EditorPart } from 'vs/workbench/browser/parts/editor/editorPart';

export import TestTextResourcePropertiesService = CommonWorkbenchTestServices.TestTextResourcePropertiesService;
export import TestContextService = CommonWorkbenchTestServices.TestContextService;
export import TestStorageService = CommonWorkbenchTestServices.TestStorageService;
export import TestWorkingCopyService = CommonWorkbenchTestServices.TestWorkingCopyService;
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IDiffEditor } from 'vs/editor/common/editorCommon';

export function createFileInput(instantiationService: IInstantiationService, resource: URI): FileEditorInput {
	return instantiationService.createInstance(FileEditorInput, resource, undefined, undefined);
}

export interface ITestInstantiationService extends IInstantiationService {
	stub<T>(service: ServiceIdentifier<T>, ctor: any): T;
}

export function workbenchInstantiationService(overrides?: { textFileService?: (instantiationService: IInstantiationService) => ITextFileService }): ITestInstantiationService {
	const instantiationService = new TestInstantiationService(new ServiceCollection([ILifecycleService, new TestLifecycleService()]));

	instantiationService.stub(IWorkingCopyService, new TestWorkingCopyService());
	instantiationService.stub(IEnvironmentService, TestEnvironmentService);
	const contextKeyService = <IContextKeyService>instantiationService.createInstance(MockContextKeyService);
	instantiationService.stub(IContextKeyService, contextKeyService);
	instantiationService.stub(IProgressService, new TestProgressService());
	const workspaceContextService = new TestContextService(TestWorkspace);
	instantiationService.stub(IWorkspaceContextService, workspaceContextService);
	const configService = new TestConfigurationService();
	instantiationService.stub(IConfigurationService, configService);
	instantiationService.stub(IFilesConfigurationService, new TestFilesConfigurationService(contextKeyService, configService, TestEnvironmentService));
	instantiationService.stub(ITextResourceConfigurationService, new TestTextResourceConfigurationService(configService));
	instantiationService.stub(IUntitledTextEditorService, instantiationService.createInstance(UntitledTextEditorService));
	instantiationService.stub(IStorageService, new TestStorageService());
	instantiationService.stub(IWorkbenchLayoutService, new TestLayoutService());
	instantiationService.stub(IDialogService, new TestDialogService());
	instantiationService.stub(IAccessibilityService, new TestAccessibilityService());
	instantiationService.stub(IFileDialogService, new TestFileDialogService());
	instantiationService.stub(IModeService, instantiationService.createInstance(ModeServiceImpl));
	instantiationService.stub(IHistoryService, new TestHistoryService());
	instantiationService.stub(ITextResourcePropertiesService, new TestTextResourcePropertiesService(configService));
	instantiationService.stub(IUndoRedoService, instantiationService.createInstance(UndoRedoService));
	instantiationService.stub(IModelService, instantiationService.createInstance(ModelServiceImpl));
	instantiationService.stub(IFileService, new TestFileService());
	instantiationService.stub(IBackupFileService, new TestBackupFileService());
	instantiationService.stub(ITelemetryService, NullTelemetryService);
	instantiationService.stub(INotificationService, new TestNotificationService());
	instantiationService.stub(IUntitledTextEditorService, instantiationService.createInstance(UntitledTextEditorService));
	instantiationService.stub(IMenuService, new TestMenuService());
	instantiationService.stub(IKeybindingService, new MockKeybindingService());
	instantiationService.stub(IDecorationsService, new TestDecorationsService());
	instantiationService.stub(IExtensionService, new TestExtensionService());
	instantiationService.stub(IWorkingCopyFileService, instantiationService.createInstance(WorkingCopyFileService));
	instantiationService.stub(ITextFileService, overrides?.textFileService ? overrides.textFileService(instantiationService) : <ITextFileService>instantiationService.createInstance(TestTextFileService));
	instantiationService.stub(IHostService, <IHostService>instantiationService.createInstance(TestHostService));
	instantiationService.stub(ITextModelService, <ITextModelService>instantiationService.createInstance(TextModelResolverService));
	const themeService = new TestThemeService();
	instantiationService.stub(IThemeService, themeService);
	instantiationService.stub(ILogService, new NullLogService());
	const editorGroupService = new TestEditorGroupsService([new TestEditorGroupView(0)]);
	instantiationService.stub(IEditorGroupsService, editorGroupService);
	instantiationService.stub(ILabelService, <ILabelService>instantiationService.createInstance(LabelService));
	const editorService = new TestEditorService(editorGroupService);
	instantiationService.stub(IEditorService, editorService);
	instantiationService.stub(ICodeEditorService, new CodeEditorService(editorService, themeService));
	instantiationService.stub(IViewletService, new TestViewletService());

	return instantiationService;
}

export class TestServiceAccessor {
	constructor(
		@ILifecycleService public lifecycleService: TestLifecycleService,
		@ITextFileService public textFileService: TestTextFileService,
		@IWorkingCopyFileService public workingCopyFileService: IWorkingCopyFileService,
		@IFilesConfigurationService public filesConfigurationService: TestFilesConfigurationService,
		@IWorkspaceContextService public contextService: TestContextService,
		@IModelService public modelService: ModelServiceImpl,
		@IFileService public fileService: TestFileService,
		@IFileDialogService public fileDialogService: TestFileDialogService,
		@IWorkingCopyService public workingCopyService: IWorkingCopyService,
		@IEditorService public editorService: TestEditorService,
		@IEditorGroupsService public editorGroupService: IEditorGroupsService,
		@IModeService public modeService: IModeService,
		@ITextModelService public textModelResolverService: ITextModelService,
		@IUntitledTextEditorService public untitledTextEditorService: UntitledTextEditorService,
		@IConfigurationService public testConfigurationService: TestConfigurationService,
		@IBackupFileService public backupFileService: TestBackupFileService,
		@IHostService public hostService: TestHostService
	) { }
}

export class TestTextFileService extends BrowserTextFileService {
	private resolveTextContentError!: FileOperationError | null;

	constructor(
		@IFileService protected fileService: IFileService,
		@IUntitledTextEditorService untitledTextEditorService: IUntitledTextEditorService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IModelService modelService: IModelService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IDialogService dialogService: IDialogService,
		@IFileDialogService fileDialogService: IFileDialogService,
		@ITextResourceConfigurationService textResourceConfigurationService: ITextResourceConfigurationService,
		@IProductService productService: IProductService,
		@IFilesConfigurationService filesConfigurationService: IFilesConfigurationService,
		@ITextModelService textModelService: ITextModelService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@IRemotePathService remotePathService: IRemotePathService,
		@IWorkingCopyFileService workingCopyFileService: IWorkingCopyFileService
	) {
		super(
			fileService,
			untitledTextEditorService,
			lifecycleService,
			instantiationService,
			modelService,
			environmentService,
			dialogService,
			fileDialogService,
			textResourceConfigurationService,
			filesConfigurationService,
			textModelService,
			codeEditorService,
			remotePathService,
			workingCopyFileService
		);
	}

	setResolveTextContentErrorOnce(error: FileOperationError): void {
		this.resolveTextContentError = error;
	}

	async readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent> {
		if (this.resolveTextContentError) {
			const error = this.resolveTextContentError;
			this.resolveTextContentError = null;

			throw error;
		}

		const content = await this.fileService.readFileStream(resource, options);
		return {
			resource: content.resource,
			name: content.name,
			mtime: content.mtime,
			ctime: content.ctime,
			etag: content.etag,
			encoding: 'utf8',
			value: await createTextBufferFactoryFromStream(content.value),
			size: 10
		};
	}
}

export const TestEnvironmentService = new BrowserWorkbenchEnvironmentService(Object.create(null));

export class TestProgressService implements IProgressService {

	_serviceBrand: undefined;

	withProgress(
		options: IProgressOptions | IProgressWindowOptions | IProgressNotificationOptions | IProgressCompositeOptions,
		task: (progress: IProgress<IProgressStep>) => Promise<any>,
		onDidCancel?: ((choice?: number | undefined) => void) | undefined
	): Promise<any> {
		return task(Progress.None);
	}
}

export class TestAccessibilityService implements IAccessibilityService {

	_serviceBrand: undefined;

	onDidChangeScreenReaderOptimized = Event.None;

	isScreenReaderOptimized(): boolean { return false; }
	alwaysUnderlineAccessKeys(): Promise<boolean> { return Promise.resolve(false); }
	setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void { }
	getAccessibilitySupport(): AccessibilitySupport { return AccessibilitySupport.Unknown; }
}

export class TestDecorationsService implements IDecorationsService {

	_serviceBrand: undefined;

	onDidChangeDecorations: Event<IResourceDecorationChangeEvent> = Event.None;

	registerDecorationsProvider(_provider: IDecorationsProvider): IDisposable { return Disposable.None; }
	getDecoration(_uri: URI, _includeChildren: boolean, _overwrite?: IDecorationData): IDecoration | undefined { return undefined; }
}

export class TestExtensionService extends NullExtensionService { }

export class TestMenuService implements IMenuService {

	_serviceBrand: undefined;

	createMenu(_id: MenuId, _scopedKeybindingService: IContextKeyService): IMenu {
		return {
			onDidChange: Event.None,
			dispose: () => undefined,
			getActions: () => []
		};
	}
}

export class TestHistoryService implements IHistoryService {

	_serviceBrand: undefined;

	constructor(private root?: URI) { }

	reopenLastClosedEditor(): void { }
	forward(): void { }
	back(): void { }
	last(): void { }
	remove(_input: IEditorInput | IResourceInput): void { }
	clear(): void { }
	clearRecentlyOpened(): void { }
	getHistory(): ReadonlyArray<IEditorInput | IResourceInput> { return []; }
	openNextRecentlyUsedEditor(group?: GroupIdentifier): void { }
	openPreviouslyUsedEditor(group?: GroupIdentifier): void { }
	getLastActiveWorkspaceRoot(_schemeFilter: string): URI | undefined { return this.root; }
	getLastActiveFile(_schemeFilter: string): URI | undefined { return undefined; }
	openLastEditLocation(): void { }
}



export class TestFileDialogService implements IFileDialogService {

	_serviceBrand: undefined;

	private confirmResult!: ConfirmResult;

	defaultFilePath(_schemeFilter?: string): URI | undefined { return undefined; }
	defaultFolderPath(_schemeFilter?: string): URI | undefined { return undefined; }
	defaultWorkspacePath(_schemeFilter?: string): URI | undefined { return undefined; }
	pickFileFolderAndOpen(_options: IPickAndOpenOptions): Promise<any> { return Promise.resolve(0); }
	pickFileAndOpen(_options: IPickAndOpenOptions): Promise<any> { return Promise.resolve(0); }
	pickFolderAndOpen(_options: IPickAndOpenOptions): Promise<any> { return Promise.resolve(0); }
	pickWorkspaceAndOpen(_options: IPickAndOpenOptions): Promise<any> { return Promise.resolve(0); }

	private fileToSave!: URI;
	setPickFileToSave(path: URI): void { this.fileToSave = path; }
	pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined> { return Promise.resolve(this.fileToSave); }

	showSaveDialog(_options: ISaveDialogOptions): Promise<URI | undefined> { return Promise.resolve(undefined); }
	showOpenDialog(_options: IOpenDialogOptions): Promise<URI[] | undefined> { return Promise.resolve(undefined); }

	setConfirmResult(result: ConfirmResult): void { this.confirmResult = result; }
	showSaveConfirm(fileNamesOrResources: (string | URI)[]): Promise<ConfirmResult> { return Promise.resolve(this.confirmResult); }
}

export class TestLayoutService implements IWorkbenchLayoutService {

	_serviceBrand: undefined;

	dimension: IDimension = { width: 800, height: 600 };

	container: HTMLElement = window.document.body;

	onZenModeChange: Event<boolean> = Event.None;
	onCenteredLayoutChange: Event<boolean> = Event.None;
	onFullscreenChange: Event<boolean> = Event.None;
	onMaximizeChange: Event<boolean> = Event.None;
	onPanelPositionChange: Event<string> = Event.None;
	onPartVisibilityChange: Event<void> = Event.None;
	onLayout = Event.None;

	private readonly _onMenubarVisibilityChange = new Emitter<Dimension>();
	get onMenubarVisibilityChange(): Event<Dimension> { return this._onMenubarVisibilityChange.event; }

	isRestored(): boolean { return true; }
	hasFocus(_part: Parts): boolean { return false; }
	hasWindowBorder(): boolean { return false; }
	getWindowBorderRadius(): string | undefined { return undefined; }
	isVisible(_part: Parts): boolean { return true; }
	getDimension(_part: Parts): Dimension { return new Dimension(0, 0); }
	getContainer(_part: Parts): HTMLElement { return null!; }
	isTitleBarHidden(): boolean { return false; }
	getTitleBarOffset(): number { return 0; }
	isStatusBarHidden(): boolean { return false; }
	isActivityBarHidden(): boolean { return false; }
	setActivityBarHidden(_hidden: boolean): void { }
	isSideBarHidden(): boolean { return false; }
	setEditorHidden(_hidden: boolean): Promise<void> { return Promise.resolve(); }
	setSideBarHidden(_hidden: boolean): Promise<void> { return Promise.resolve(); }
	isPanelHidden(): boolean { return false; }
	setPanelHidden(_hidden: boolean): Promise<void> { return Promise.resolve(); }
	toggleMaximizedPanel(): void { }
	isPanelMaximized(): boolean { return false; }
	getMenubarVisibility(): MenuBarVisibility { throw new Error('not implemented'); }
	getSideBarPosition() { return 0; }
	getPanelPosition() { return 0; }
	setPanelPosition(_position: PartPosition): Promise<void> { return Promise.resolve(); }
	addClass(_clazz: string): void { }
	removeClass(_clazz: string): void { }
	getMaximumEditorDimensions(): Dimension { throw new Error('not implemented'); }
	getWorkbenchContainer(): HTMLElement { throw new Error('not implemented'); }
	getWorkbenchElement(): HTMLElement { throw new Error('not implemented'); }
	toggleZenMode(): void { }
	isEditorLayoutCentered(): boolean { return false; }
	centerEditorLayout(_active: boolean): void { }
	resizePart(_part: Parts, _sizeChange: number): void { }
	registerPart(part: Part): void { }
	isWindowMaximized() { return false; }
	updateWindowMaximizedState(maximized: boolean): void { }
	getVisibleNeighborPart(part: Parts, direction: Direction): Parts | undefined { return undefined; }
}

let activeViewlet: Viewlet = {} as any;

export class TestViewletService implements IViewletService {
	_serviceBrand: undefined;

	onDidViewletRegisterEmitter = new Emitter<ViewletDescriptor>();
	onDidViewletDeregisterEmitter = new Emitter<ViewletDescriptor>();
	onDidViewletOpenEmitter = new Emitter<IViewlet>();
	onDidViewletCloseEmitter = new Emitter<IViewlet>();

	onDidViewletRegister = this.onDidViewletRegisterEmitter.event;
	onDidViewletDeregister = this.onDidViewletDeregisterEmitter.event;
	onDidViewletOpen = this.onDidViewletOpenEmitter.event;
	onDidViewletClose = this.onDidViewletCloseEmitter.event;

	openViewlet(id: string, focus?: boolean): Promise<IViewlet | undefined> { return Promise.resolve(undefined); }
	getViewlets(): ViewletDescriptor[] { return []; }
	getAllViewlets(): ViewletDescriptor[] { return []; }
	getActiveViewlet(): IViewlet { return activeViewlet; }
	getDefaultViewletId(): string { return 'workbench.view.explorer'; }
	getViewlet(id: string): ViewletDescriptor | undefined { return undefined; }
	getProgressIndicator(id: string) { return undefined; }
	hideActiveViewlet(): void { }
	getLastActiveViewletId(): string { return undefined!; }
	dispose() { }
}

export class TestPanelService implements IPanelService {
	_serviceBrand: undefined;

	onDidPanelOpen = new Emitter<{ panel: IPanel, focus: boolean }>().event;
	onDidPanelClose = new Emitter<IPanel>().event;

	async openPanel(id?: string, focus?: boolean): Promise<undefined> { return undefined; }
	getPanel(id: string): any { return activeViewlet; }
	getPanels() { return []; }
	getPinnedPanels() { return []; }
	getActivePanel(): IViewlet { return activeViewlet; }
	setPanelEnablement(id: string, enabled: boolean): void { }
	dispose() { }
	showActivity(panelId: string, badge: IBadge, clazz?: string): IDisposable { throw new Error('Method not implemented.'); }
	getProgressIndicator(id: string) { return null!; }
	hideActivePanel(): void { }
	getLastActivePanelId(): string { return undefined!; }
}

export class TestEditorGroupsService implements IEditorGroupsService {

	_serviceBrand: undefined;

	constructor(public groups: TestEditorGroupView[] = []) { }

	onDidActiveGroupChange: Event<IEditorGroup> = Event.None;
	onDidActivateGroup: Event<IEditorGroup> = Event.None;
	onDidAddGroup: Event<IEditorGroup> = Event.None;
	onDidRemoveGroup: Event<IEditorGroup> = Event.None;
	onDidMoveGroup: Event<IEditorGroup> = Event.None;
	onDidGroupIndexChange: Event<IEditorGroup> = Event.None;
	onDidLayout: Event<IDimension> = Event.None;
	onDidEditorPartOptionsChange = Event.None;

	orientation = GroupOrientation.HORIZONTAL;
	whenRestored: Promise<void> = Promise.resolve(undefined);
	willRestoreEditors = false;

	contentDimension = { width: 800, height: 600 };

	get activeGroup(): IEditorGroup { return this.groups[0]; }
	get count(): number { return this.groups.length; }

	getGroups(_order?: GroupsOrder): ReadonlyArray<IEditorGroup> { return this.groups; }
	getGroup(identifier: number): IEditorGroup | undefined { return find(this.groups, group => group.id === identifier); }
	getLabel(_identifier: number): string { return 'Group 1'; }
	findGroup(_scope: IFindGroupScope, _source?: number | IEditorGroup, _wrap?: boolean): IEditorGroup { throw new Error('not implemented'); }
	activateGroup(_group: number | IEditorGroup): IEditorGroup { throw new Error('not implemented'); }
	restoreGroup(_group: number | IEditorGroup): IEditorGroup { throw new Error('not implemented'); }
	getSize(_group: number | IEditorGroup): { width: number, height: number } { return { width: 100, height: 100 }; }
	setSize(_group: number | IEditorGroup, _size: { width: number, height: number }): void { }
	arrangeGroups(_arrangement: GroupsArrangement): void { }
	applyLayout(_layout: EditorGroupLayout): void { }
	setGroupOrientation(_orientation: GroupOrientation): void { }
	addGroup(_location: number | IEditorGroup, _direction: GroupDirection, _options?: IAddGroupOptions): IEditorGroup { throw new Error('not implemented'); }
	removeGroup(_group: number | IEditorGroup): void { }
	moveGroup(_group: number | IEditorGroup, _location: number | IEditorGroup, _direction: GroupDirection): IEditorGroup { throw new Error('not implemented'); }
	mergeGroup(_group: number | IEditorGroup, _target: number | IEditorGroup, _options?: IMergeGroupOptions): IEditorGroup { throw new Error('not implemented'); }
	copyGroup(_group: number | IEditorGroup, _location: number | IEditorGroup, _direction: GroupDirection): IEditorGroup { throw new Error('not implemented'); }
	centerLayout(active: boolean): void { }
	isLayoutCentered(): boolean { return false; }

	partOptions!: IEditorPartOptions;
	enforcePartOptions(options: IEditorPartOptions): IDisposable { return Disposable.None; }
}

export class TestEditorGroupView implements IEditorGroupView {

	constructor(public id: number) { }

	get group(): EditorGroup { throw new Error('not implemented'); }
	activeControl!: IVisibleEditor;
	activeEditor!: IEditorInput;
	previewEditor!: IEditorInput;
	count!: number;
	disposed!: boolean;
	editors: ReadonlyArray<IEditorInput> = [];
	label!: string;
	ariaLabel!: string;
	index!: number;
	whenRestored: Promise<void> = Promise.resolve(undefined);
	element!: HTMLElement;
	minimumWidth!: number;
	maximumWidth!: number;
	minimumHeight!: number;
	maximumHeight!: number;

	isEmpty = true;
	isMinimized = false;

	onWillDispose: Event<void> = Event.None;
	onDidGroupChange: Event<IGroupChangeEvent> = Event.None;
	onWillCloseEditor: Event<IEditorCloseEvent> = Event.None;
	onDidCloseEditor: Event<IEditorCloseEvent> = Event.None;
	onWillOpenEditor: Event<IEditorOpeningEvent> = Event.None;
	onDidOpenEditorFail: Event<IEditorInput> = Event.None;
	onDidFocus: Event<void> = Event.None;
	onDidChange: Event<{ width: number; height: number; }> = Event.None;

	getEditors(_order?: EditorsOrder): ReadonlyArray<IEditorInput> { return []; }
	getEditorByIndex(_index: number): IEditorInput { throw new Error('not implemented'); }
	getIndexOfEditor(_editor: IEditorInput): number { return -1; }
	openEditor(_editor: IEditorInput, _options?: IEditorOptions): Promise<IEditor> { throw new Error('not implemented'); }
	openEditors(_editors: IEditorInputWithOptions[]): Promise<IEditor> { throw new Error('not implemented'); }
	isOpened(_editor: IEditorInput | IResourceInput): boolean { return false; }
	isPinned(_editor: IEditorInput): boolean { return false; }
	isActive(_editor: IEditorInput): boolean { return false; }
	moveEditor(_editor: IEditorInput, _target: IEditorGroup, _options?: IMoveEditorOptions): void { }
	copyEditor(_editor: IEditorInput, _target: IEditorGroup, _options?: ICopyEditorOptions): void { }
	closeEditor(_editor?: IEditorInput, options?: ICloseEditorOptions): Promise<void> { return Promise.resolve(); }
	closeEditors(_editors: IEditorInput[] | { except?: IEditorInput; direction?: CloseDirection; savedOnly?: boolean; }, options?: ICloseEditorOptions): Promise<void> { return Promise.resolve(); }
	closeAllEditors(): Promise<void> { return Promise.resolve(); }
	replaceEditors(_editors: IEditorReplacement[]): Promise<void> { return Promise.resolve(); }
	pinEditor(_editor?: IEditorInput): void { }
	focus(): void { }
	invokeWithinContext<T>(fn: (accessor: ServicesAccessor) => T): T { throw new Error('not implemented'); }
	setActive(_isActive: boolean): void { }
	notifyIndexChanged(_index: number): void { }
	dispose(): void { }
	toJSON(): object { return Object.create(null); }
	layout(_width: number, _height: number): void { }
	relayout() { }
}

export class TestEditorGroupAccessor implements IEditorGroupsAccessor {

	groups: IEditorGroupView[] = [];
	activeGroup!: IEditorGroupView;

	partOptions: IEditorPartOptions = {};

	onDidEditorPartOptionsChange = Event.None;
	onDidVisibilityChange = Event.None;

	getGroup(identifier: number): IEditorGroupView | undefined { throw new Error('Method not implemented.'); }
	getGroups(order: GroupsOrder): IEditorGroupView[] { throw new Error('Method not implemented.'); }
	activateGroup(identifier: number | IEditorGroupView): IEditorGroupView { throw new Error('Method not implemented.'); }
	restoreGroup(identifier: number | IEditorGroupView): IEditorGroupView { throw new Error('Method not implemented.'); }
	addGroup(location: number | IEditorGroupView, direction: GroupDirection, options?: IAddGroupOptions | undefined): IEditorGroupView { throw new Error('Method not implemented.'); }
	mergeGroup(group: number | IEditorGroupView, target: number | IEditorGroupView, options?: IMergeGroupOptions | undefined): IEditorGroupView { throw new Error('Method not implemented.'); }
	moveGroup(group: number | IEditorGroupView, location: number | IEditorGroupView, direction: GroupDirection): IEditorGroupView { throw new Error('Method not implemented.'); }
	copyGroup(group: number | IEditorGroupView, location: number | IEditorGroupView, direction: GroupDirection): IEditorGroupView { throw new Error('Method not implemented.'); }
	removeGroup(group: number | IEditorGroupView): void { throw new Error('Method not implemented.'); }
	arrangeGroups(arrangement: GroupsArrangement, target?: number | IEditorGroupView | undefined): void { throw new Error('Method not implemented.'); }
}

export class TestEditorService implements EditorServiceImpl {

	_serviceBrand: undefined;

	onDidActiveEditorChange: Event<void> = Event.None;
	onDidVisibleEditorsChange: Event<void> = Event.None;
	onDidCloseEditor: Event<IEditorCloseEvent> = Event.None;
	onDidOpenEditorFail: Event<IEditorIdentifier> = Event.None;
	onDidMostRecentlyActiveEditorsChange: Event<void> = Event.None;

	activeControl: IVisibleEditor | undefined;
	activeTextEditorWidget: ICodeEditor | IDiffEditor | undefined;
	activeTextEditorMode: string | undefined;
	activeEditor: IEditorInput | undefined;
	editors: ReadonlyArray<IEditorInput> = [];
	mostRecentlyActiveEditors: ReadonlyArray<IEditorIdentifier> = [];
	visibleControls: ReadonlyArray<IVisibleEditor> = [];
	visibleTextEditorWidgets = [];
	visibleEditors: ReadonlyArray<IEditorInput> = [];
	count = this.editors.length;

	constructor(private editorGroupService?: IEditorGroupsService) { }

	getEditors() { return []; }
	overrideOpenEditor(_handler: IOpenEditorOverrideHandler): IDisposable { return toDisposable(() => undefined); }
	openEditor(editor: IEditorInput, options?: IEditorOptions | ITextEditorOptions, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE): Promise<IEditor | undefined>;
	openEditor(editor: IResourceInput | IUntitledTextResourceInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE): Promise<ITextEditor | undefined>;
	openEditor(editor: IResourceDiffInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE): Promise<ITextDiffEditor | undefined>;
	openEditor(editor: IResourceSideBySideInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE): Promise<ITextSideBySideEditor | undefined>;
	async openEditor(editor: IEditorInput | IResourceEditor, optionsOrGroup?: IEditorOptions | ITextEditorOptions | IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE): Promise<IEditor | undefined> {
		throw new Error('not implemented');
	}
	doResolveEditorOpenRequest(editor: IEditorInput | IResourceEditor): [IEditorGroup, EditorInput, EditorOptions | undefined] | undefined {
		if (!this.editorGroupService) {
			return undefined;
		}

		return [this.editorGroupService.activeGroup, editor as EditorInput, undefined];
	}
	openEditors(_editors: any, _group?: any): Promise<IEditor[]> { throw new Error('not implemented'); }
	isOpen(_editor: IEditorInput | IResourceInput): boolean { return false; }
	replaceEditors(_editors: any, _group: any) { return Promise.resolve(undefined); }
	invokeWithinEditorContext<T>(fn: (accessor: ServicesAccessor) => T): T { throw new Error('not implemented'); }
	createInput(_input: IResourceInput | IUntitledTextResourceInput | IResourceDiffInput | IResourceSideBySideInput): EditorInput { throw new Error('not implemented'); }
	save(editors: IEditorIdentifier[], options?: ISaveEditorsOptions): Promise<boolean> { throw new Error('Method not implemented.'); }
	saveAll(options?: ISaveEditorsOptions): Promise<boolean> { throw new Error('Method not implemented.'); }
	revert(editors: IEditorIdentifier[], options?: IRevertOptions): Promise<void> { throw new Error('Method not implemented.'); }
	revertAll(options?: IRevertAllEditorsOptions): Promise<void> { throw new Error('Method not implemented.'); }
}

export class TestFileService implements IFileService {

	_serviceBrand: undefined;

	private readonly _onDidFilesChange = new Emitter<FileChangesEvent>();
	private readonly _onDidRunOperation = new Emitter<FileOperationEvent>();

	readonly onWillActivateFileSystemProvider = Event.None;
	readonly onDidChangeFileSystemProviderCapabilities = Event.None;
	readonly onError: Event<Error> = Event.None;

	private content = 'Hello Html';
	private lastReadFileUri!: URI;

	setContent(content: string): void { this.content = content; }
	getContent(): string { return this.content; }
	getLastReadFileUri(): URI { return this.lastReadFileUri; }
	get onDidFilesChange(): Event<FileChangesEvent> { return this._onDidFilesChange.event; }
	fireFileChanges(event: FileChangesEvent): void { this._onDidFilesChange.fire(event); }
	get onDidRunOperation(): Event<FileOperationEvent> { return this._onDidRunOperation.event; }
	fireAfterOperation(event: FileOperationEvent): void { this._onDidRunOperation.fire(event); }
	resolve(resource: URI, _options?: IResolveFileOptions): Promise<IFileStat>;
	resolve(resource: URI, _options: IResolveMetadataFileOptions): Promise<IFileStatWithMetadata>;
	resolve(resource: URI, _options?: IResolveFileOptions): Promise<IFileStat> {
		return Promise.resolve({
			resource,
			etag: Date.now().toString(),
			encoding: 'utf8',
			mtime: Date.now(),
			size: 42,
			isFile: true,
			isDirectory: false,
			isSymbolicLink: false,
			name: resources.basename(resource)
		});
	}

	async resolveAll(toResolve: { resource: URI, options?: IResolveFileOptions }[]): Promise<IResolveFileResult[]> {
		const stats = await Promise.all(toResolve.map(resourceAndOption => this.resolve(resourceAndOption.resource, resourceAndOption.options)));

		return stats.map(stat => ({ stat, success: true }));
	}

	async exists(_resource: URI): Promise<boolean> { return true; }

	readFile(resource: URI, options?: IReadFileOptions | undefined): Promise<IFileContent> {
		this.lastReadFileUri = resource;

		return Promise.resolve({
			resource: resource,
			value: VSBuffer.fromString(this.content),
			etag: 'index.txt',
			encoding: 'utf8',
			mtime: Date.now(),
			ctime: Date.now(),
			name: resources.basename(resource),
			size: 1
		});
	}

	readFileStream(resource: URI, options?: IReadFileOptions | undefined): Promise<IFileStreamContent> {
		this.lastReadFileUri = resource;

		return Promise.resolve({
			resource: resource,
			value: {
				on: (event: string, callback: Function): void => {
					if (event === 'data') {
						callback(this.content);
					}
					if (event === 'end') {
						callback();
					}
				},
				resume: () => { },
				pause: () => { },
				destroy: () => { }
			},
			etag: 'index.txt',
			encoding: 'utf8',
			mtime: Date.now(),
			ctime: Date.now(),
			size: 1,
			name: resources.basename(resource)
		});
	}

	writeShouldThrowError: Error | undefined = undefined;

	async writeFile(resource: URI, bufferOrReadable: VSBuffer | VSBufferReadable, options?: IWriteFileOptions): Promise<IFileStatWithMetadata> {
		await timeout(0);

		if (this.writeShouldThrowError) {
			throw this.writeShouldThrowError;
		}

		return ({
			resource,
			etag: 'index.txt',
			mtime: Date.now(),
			ctime: Date.now(),
			size: 42,
			isFile: true,
			isDirectory: false,
			isSymbolicLink: false,
			name: resources.basename(resource)
		});
	}

	move(_source: URI, _target: URI, _overwrite?: boolean): Promise<IFileStatWithMetadata> { return Promise.resolve(null!); }
	copy(_source: URI, _target: URI, _overwrite?: boolean): Promise<IFileStatWithMetadata> { return Promise.resolve(null!); }
	createFile(_resource: URI, _content?: VSBuffer | VSBufferReadable, _options?: ICreateFileOptions): Promise<IFileStatWithMetadata> { return Promise.resolve(null!); }
	createFolder(_resource: URI): Promise<IFileStatWithMetadata> { throw new Error('not implemented'); }

	onDidChangeFileSystemProviderRegistrations = Event.None;

	private providers = new Map<string, IFileSystemProvider>();

	registerProvider(scheme: string, provider: IFileSystemProvider) {
		this.providers.set(scheme, provider);

		return toDisposable(() => this.providers.delete(scheme));
	}

	activateProvider(_scheme: string): Promise<void> { throw new Error('not implemented'); }
	canHandleResource(resource: URI): boolean { return resource.scheme === 'file' || this.providers.has(resource.scheme); }
	hasCapability(resource: URI, capability: FileSystemProviderCapabilities): boolean {
		if (capability === FileSystemProviderCapabilities.PathCaseSensitive && isLinux) {
			return true;
		}

		return false;
	}

	del(_resource: URI, _options?: { useTrash?: boolean, recursive?: boolean }): Promise<void> { return Promise.resolve(); }

	readonly watches: URI[] = [];
	watch(_resource: URI): IDisposable {
		this.watches.push(_resource);

		return toDisposable(() => this.watches.splice(this.watches.indexOf(_resource), 1));
	}

	getWriteEncoding(_resource: URI): IResourceEncoding { return { encoding: 'utf8', hasBOM: false }; }
	dispose(): void { }
}

export class TestBackupFileService implements IBackupFileService {
	_serviceBrand: undefined;

	hasBackups(): Promise<boolean> { return Promise.resolve(false); }
	hasBackup(_resource: URI): Promise<boolean> { return Promise.resolve(false); }
	hasBackupSync(resource: URI, versionId?: number): boolean { return false; }
	registerResourceForBackup(_resource: URI): Promise<void> { return Promise.resolve(); }
	deregisterResourceForBackup(_resource: URI): Promise<void> { return Promise.resolve(); }
	backup<T extends object>(_resource: URI, _content?: ITextSnapshot, versionId?: number, meta?: T): Promise<void> { return Promise.resolve(); }
	getBackups(): Promise<URI[]> { return Promise.resolve([]); }
	resolve<T extends object>(_backup: URI): Promise<IResolvedBackup<T> | undefined> { return Promise.resolve(undefined); }
	discardBackup(_resource: URI): Promise<void> { return Promise.resolve(); }
	parseBackupContent(textBufferFactory: ITextBufferFactory): string {
		const textBuffer = textBufferFactory.create(DefaultEndOfLine.LF);
		const lineCount = textBuffer.getLineCount();
		const range = new Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
		return textBuffer.getValueInRange(range, EndOfLinePreference.TextDefined);
	}
}

export class TestLifecycleService implements ILifecycleService {

	_serviceBrand: undefined;

	phase!: LifecyclePhase;
	startupKind!: StartupKind;

	private readonly _onBeforeShutdown = new Emitter<BeforeShutdownEvent>();
	get onBeforeShutdown(): Event<BeforeShutdownEvent> { return this._onBeforeShutdown.event; }

	private readonly _onWillShutdown = new Emitter<WillShutdownEvent>();
	get onWillShutdown(): Event<WillShutdownEvent> { return this._onWillShutdown.event; }

	private readonly _onShutdown = new Emitter<void>();
	get onShutdown(): Event<void> { return this._onShutdown.event; }

	when(): Promise<void> { return Promise.resolve(); }

	fireShutdown(reason = ShutdownReason.QUIT): void {
		this._onWillShutdown.fire({
			join: () => { },
			reason
		});
	}

	fireWillShutdown(event: BeforeShutdownEvent): void { this._onBeforeShutdown.fire(event); }
}

export class TestTextResourceConfigurationService implements ITextResourceConfigurationService {

	_serviceBrand: undefined;

	constructor(private configurationService = new TestConfigurationService()) { }

	onDidChangeConfiguration() {
		return { dispose() { } };
	}

	getValue<T>(resource: URI, arg2?: any, arg3?: any): T {
		const position: IPosition | null = EditorPosition.isIPosition(arg2) ? arg2 : null;
		const section: string | undefined = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
		return this.configurationService.getValue(section, { resource });
	}

	updateValue(resource: URI, key: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void> {
		return this.configurationService.updateValue(key, value);
	}
}

export class RemoteFileSystemProvider implements IFileSystemProvider {

	constructor(private readonly diskFileSystemProvider: IFileSystemProvider, private readonly remoteAuthority: string) { }

	readonly capabilities: FileSystemProviderCapabilities = this.diskFileSystemProvider.capabilities;
	readonly onDidChangeCapabilities: Event<void> = this.diskFileSystemProvider.onDidChangeCapabilities;

	readonly onDidChangeFile: Event<readonly IFileChange[]> = Event.map(this.diskFileSystemProvider.onDidChangeFile, changes => changes.map((c): IFileChange => {
		return {
			type: c.type,
			resource: c.resource.with({ scheme: Schemas.vscodeRemote, authority: this.remoteAuthority }),
		};
	}));
	watch(resource: URI, opts: IWatchOptions): IDisposable { return this.diskFileSystemProvider.watch(this.toFileResource(resource), opts); }

	stat(resource: URI): Promise<IStat> { return this.diskFileSystemProvider.stat(this.toFileResource(resource)); }
	mkdir(resource: URI): Promise<void> { return this.diskFileSystemProvider.mkdir(this.toFileResource(resource)); }
	readdir(resource: URI): Promise<[string, FileType][]> { return this.diskFileSystemProvider.readdir(this.toFileResource(resource)); }
	delete(resource: URI, opts: FileDeleteOptions): Promise<void> { return this.diskFileSystemProvider.delete(this.toFileResource(resource), opts); }

	rename(from: URI, to: URI, opts: FileOverwriteOptions): Promise<void> { return this.diskFileSystemProvider.rename(this.toFileResource(from), this.toFileResource(to), opts); }
	copy(from: URI, to: URI, opts: FileOverwriteOptions): Promise<void> { return this.diskFileSystemProvider.copy!(this.toFileResource(from), this.toFileResource(to), opts); }

	readFile(resource: URI): Promise<Uint8Array> { return this.diskFileSystemProvider.readFile!(this.toFileResource(resource)); }
	writeFile(resource: URI, content: Uint8Array, opts: FileWriteOptions): Promise<void> { return this.diskFileSystemProvider.writeFile!(this.toFileResource(resource), content, opts); }

	open(resource: URI, opts: FileOpenOptions): Promise<number> { return this.diskFileSystemProvider.open!(this.toFileResource(resource), opts); }
	close(fd: number): Promise<void> { return this.diskFileSystemProvider.close!(fd); }
	read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number> { return this.diskFileSystemProvider.read!(fd, pos, data, offset, length); }
	write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number> { return this.diskFileSystemProvider.write!(fd, pos, data, offset, length); }

	private toFileResource(resource: URI): URI { return resource.with({ scheme: Schemas.file, authority: '' }); }
}

export const productService: IProductService = { _serviceBrand: undefined, ...product };

export class TestHostService implements IHostService {

	_serviceBrand: undefined;

	private _hasFocus = true;
	get hasFocus() { return this._hasFocus; }
	async hadLastFocus(): Promise<boolean> { return this._hasFocus; }

	private _onDidChangeFocus = new Emitter<boolean>();
	readonly onDidChangeFocus = this._onDidChangeFocus.event;

	setFocus(focus: boolean) {
		this._hasFocus = focus;
		this._onDidChangeFocus.fire(this._hasFocus);
	}

	async restart(): Promise<void> { }
	async reload(): Promise<void> { }

	async focus(): Promise<void> { }

	async openWindow(arg1?: IOpenEmptyWindowOptions | IWindowOpenable[], arg2?: IOpenWindowOptions): Promise<void> { }

	async toggleFullScreen(): Promise<void> { }
}

export class TestFilesConfigurationService extends FilesConfigurationService {

	onFilesConfigurationChange(configuration: any): void {
		super.onFilesConfigurationChange(configuration);
	}
}

export class TestReadonlyTextFileEditorModel extends TextFileEditorModel {

	isReadonly(): boolean {
		return true;
	}
}

export class TestEditorInput extends EditorInput {

	constructor(public resource: URI, private typeId: string) {
		super();
	}

	getTypeId(): string {
		return this.typeId;
	}

	resolve(): Promise<IEditorModel | null> {
		return Promise.resolve(null);
	}
}

export function registerTestEditor(id: string, inputs: SyncDescriptor<EditorInput>[], factoryInputId?: string): IDisposable {
	class TestEditorControl extends BaseEditor {

		constructor() { super(id, NullTelemetryService, new TestThemeService(), new TestStorageService()); }

		async setInput(input: EditorInput, options: EditorOptions | undefined, token: CancellationToken): Promise<void> {
			super.setInput(input, options, token);

			await input.resolve();
		}

		getId(): string { return id; }
		layout(): void { }
		createEditor(): void { }
	}

	const disposables = new DisposableStore();

	disposables.add(Registry.as<IEditorRegistry>(Extensions.Editors).registerEditor(EditorDescriptor.create(TestEditorControl, id, 'Test Editor Control'), inputs));

	if (factoryInputId) {

		interface ISerializedTestInput {
			resource: string;
		}

		class EditorsObserverTestEditorInputFactory implements IEditorInputFactory {

			canSerialize(editorInput: EditorInput): boolean {
				return true;
			}

			serialize(editorInput: EditorInput): string {
				let testEditorInput = <TestFileEditorInput>editorInput;
				let testInput: ISerializedTestInput = {
					resource: testEditorInput.resource.toString()
				};

				return JSON.stringify(testInput);
			}

			deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput {
				let testInput: ISerializedTestInput = JSON.parse(serializedEditorInput);

				return new TestFileEditorInput(URI.parse(testInput.resource), factoryInputId!);
			}
		}

		disposables.add(Registry.as<IEditorInputFactoryRegistry>(EditorExtensions.EditorInputFactories).registerEditorInputFactory(factoryInputId, EditorsObserverTestEditorInputFactory));
	}

	return disposables;
}

export class TestFileEditorInput extends EditorInput implements IFileEditorInput {
	gotDisposed = false;
	gotSaved = false;
	gotSavedAs = false;
	gotReverted = false;
	dirty = false;
	private fails = false;

	constructor(
		public resource: URI,
		private typeId: string
	) {
		super();
	}

	getTypeId() { return this.typeId; }
	resolve(): Promise<IEditorModel | null> { return !this.fails ? Promise.resolve(null) : Promise.reject(new Error('fails')); }
	matches(other: TestEditorInput): boolean { return other && other.resource && this.resource.toString() === other.resource.toString() && other instanceof TestFileEditorInput && other.getTypeId() === this.typeId; }
	setEncoding(encoding: string) { }
	getEncoding() { return undefined; }
	setPreferredEncoding(encoding: string) { }
	setMode(mode: string) { }
	setPreferredMode(mode: string) { }
	setForceOpenAsBinary(): void { }
	setFailToOpen(): void {
		this.fails = true;
	}
	async save(groupId: GroupIdentifier, options?: ISaveOptions): Promise<IEditorInput | undefined> {
		this.gotSaved = true;
		return this;
	}
	async saveAs(groupId: GroupIdentifier, options?: ISaveOptions): Promise<IEditorInput | undefined> {
		this.gotSavedAs = true;
		return this;
	}
	async revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void> {
		this.gotReverted = true;
		this.gotSaved = false;
		this.gotSavedAs = false;
	}
	setDirty(): void { this.dirty = true; }
	isDirty(): boolean {
		return this.dirty;
	}
	isReadonly(): boolean {
		return false;
	}
	isResolved(): boolean { return false; }
	dispose(): void {
		super.dispose();
		this.gotDisposed = true;
	}
	movedEditor: IMoveResult | undefined = undefined;
	move(): IMoveResult | undefined { return this.movedEditor; }
}

export class TestEditorPart extends EditorPart {

	saveState(): void {
		return super.saveState();
	}

	clearState(): void {
		const workspaceMemento = this.getMemento(StorageScope.WORKSPACE);
		for (const key of Object.keys(workspaceMemento)) {
			delete workspaceMemento[key];
		}

		const globalMemento = this.getMemento(StorageScope.GLOBAL);
		for (const key of Object.keys(globalMemento)) {
			delete globalMemento[key];
		}
	}
}
