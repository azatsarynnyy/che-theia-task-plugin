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
import { Container } from 'inversify';
import { instance, mock, verify, when, anything, deepEqual, resetCalls, anyString } from 'ts-mockito';
import { WidgetManager, ApplicationShell, Widget } from '@theia/core/lib/browser';
import { WindowService, DefaultWindowService } from '@theia/core/lib/browser/window/window-service';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { PreviewUrlOpenService } from './preview-url-open-service';
import { CheTaskConfiguration } from '../../common/task-protocol';

disableJSDOM();

describe('preview-url-open-service', () => {

    let testContainer: Container;
    const widgetManager = mock(WidgetManager);
    const appShell = mock(ApplicationShell);
    const resolver = mock(VariableResolverService);
    const windowService = mock(DefaultWindowService);
    let previewService: PreviewUrlOpenService;

    const previewUrl = 'http://www.example.org:${port}';
    const resolvedPreviewURL = 'http://www.example.org:8080';

    before(() => {
        testContainer = new Container();
        testContainer.bind(WidgetManager).toConstantValue(instance(widgetManager));
        testContainer.bind(ApplicationShell).toConstantValue(instance(appShell));
        testContainer.bind(VariableResolverService).toConstantValue(instance(resolver));
        testContainer.bind(WindowService).toConstantValue(instance(windowService));
        testContainer.bind(PreviewUrlOpenService).toSelf();

        when(resolver.resolve(deepEqual(previewUrl))).thenResolve(resolvedPreviewURL);
    });

    beforeEach(() => {
        previewService = testContainer.get(PreviewUrlOpenService);
    });

    afterEach(() => {
        resetCalls(resolver);
    });

    it('should-open-externally', async () => {
        await previewService.preview(createTestTask(), true);

        verify(resolver.resolve(deepEqual(previewUrl))).once();
        verify(windowService.openNewWindow(deepEqual(resolvedPreviewURL))).once();
    });

    it('should-open-internally', async () => {
        const widget = mock(Widget);
        when(widgetManager.getOrCreateWidget(anyString(), anything())).thenResolve(instance(widget));

        await previewService.preview(createTestTask());

        verify(resolver.resolve(deepEqual(previewUrl))).once();
        verify(appShell.addWidget(anything(), anything())).once();
        verify(appShell.activateWidget(anyString())).once();
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
