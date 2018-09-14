/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { enableJSDOM } from '@theia/core/lib/browser/test/jsdom';

const disableJSDOM = enableJSDOM();

import 'mocha';
import { Container, ContainerModule } from 'inversify';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { MockWindowService } from '@theia/core/lib/browser/window/test/mock-window-service';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { MockVariableResolverService } from '@theia/variable-resolver/lib/browser/test';
import { PreviewUrlOpenService } from './preview-url-open-service';
import { CheTaskConfiguration } from '../../common/task-protocol';

disableJSDOM();

let testContainer: Container;
let previewService: PreviewUrlOpenService;

const previewUrl = 'http://www.example.org:${port}';
// const resolvedPreviewURL = 'http://www.example.org:8080';

before(() => {
    testContainer = new Container();

    const module = new ContainerModule((bind, unbind, isBound, rebind) => {
        // bind(WidgetManager).to();
        // bind(ApplicationShell).to();
        bind(VariableResolverService).to(MockVariableResolverService);
        bind(PreviewUrlOpenService).toSelf();
        bind(WindowService).to(MockWindowService);
    });

    testContainer.load(module);
});

describe('preview-url-open-service-2', () => {

    beforeEach(() => {
        previewService = testContainer.get(PreviewUrlOpenService);
    });

    it('should-open-externally', async () => {
        await previewService.preview(createTestTask(), true);
    });

    function createTestTask(): CheTaskConfiguration {
        return {
            type: 'che',
            command: 'ls',
            label: 'task',
            previewUrl
        };
    }
});
