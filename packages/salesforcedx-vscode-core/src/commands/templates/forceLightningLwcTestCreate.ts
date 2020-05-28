import {
  Command,
  SfdxCommandBuilder
} from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import * as path from 'path';
import { DirFileNameSelection } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { LocalComponent } from '@salesforce/salesforcedx-utils-vscode/src/types';
import { Uri } from 'vscode';
import { nls } from '../../messages';
import { sfdxCoreSettings } from '../../settings';
import {
  CompositeParametersGatherer,
  SelectFileName,
  SelectOutputDir,
  SfdxCommandlet,
  SfdxWorkspaceChecker,
  PathStrategyFactory,
  SourcePathStrategy
} from '../util';
import { MetadataTypeGatherer } from '../util';
import { OverwriteComponentPrompt } from '../util/postconditionCheckers';
import { BaseTemplateCommand } from './baseTemplateCommand';
import {
  FileInternalPathGatherer,
  InternalDevWorkspaceChecker
} from './internalCommandUtils';
import { LWC_DIRECTORY, LWC_TYPE } from './metadataTypeConstants';
import { RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { SelectLwcComponentDir } from '../util/parameterGatherers';
import { stringify } from 'querystring';
import { getRootWorkspace, getRootWorkspacePath } from '../../util';

export class ForceLightningLwcTestCreateExecutor extends BaseTemplateCommand {
  constructor() {
    super(LWC_TYPE);
  }

  public build(data: DirFileNameSelection): Command {
    const d = data.fileName
    const builder = new SfdxCommandBuilder()
      .withDescription(nls.localize('force_lightning_lwc_test_create_text'))
      .withArg('force:lightning:lwc:test:create')
      .withFlag('--filepath', path.join(getRootWorkspacePath(), data.outputdir, data.fileName + ".js"))
      .withLogName('force_lightning_web_component_test_create');

    if (sfdxCoreSettings.getInternalDev()) {
      builder.withArg('--internal');
    }
    return builder.build();
  }

  public getSourcePathStrategy(): SourcePathStrategy {
    return PathStrategyFactory.createLwcTestStrategy()
  }
}

const filePathGatherer = new SelectLwcComponentDir(LWC_DIRECTORY, true)
const metadataTypeGatherer = new MetadataTypeGatherer(LWC_TYPE);
export async function forceLightningLwcTestCreate() {
  const commandlet = new SfdxCommandlet(
    new SfdxWorkspaceChecker(),
    new CompositeParametersGatherer<LocalComponent>(
      metadataTypeGatherer,
      filePathGatherer
    ),
    new ForceLightningLwcTestCreateExecutor(),
    new OverwriteComponentPrompt()
  );
  await commandlet.run();
}

export async function forceInternalLightningLwcTestCreate(sourceUri: Uri) {
  const commandlet = new SfdxCommandlet(
    new InternalDevWorkspaceChecker(),
    new CompositeParametersGatherer(
      filePathGatherer,
      new FileInternalPathGatherer(sourceUri)
    ),
    new ForceLightningLwcTestCreateExecutor()
  );
  await commandlet.run();
}