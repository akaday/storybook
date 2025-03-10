// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import React from 'react';

import type { NodeResult } from 'axe-core';

import { A11yContext, type A11yContextStore } from '../A11yContext';
import HighlightToggle from './HighlightToggle';

const nodeResult = (target: string): NodeResult => ({
  html: '',
  target: [target],
  any: [],
  all: [],
  none: [],
});

const defaultProviderValue: A11yContextStore = {
  results: {
    passes: [],
    incomplete: [],
    violations: [],
  },
  status: 'initial',
  discrepancy: null,
  error: null,
  setStatus: vi.fn(),
  handleManual: vi.fn(),
  highlighted: [],
  toggleHighlight: vi.fn(),
  clearHighlights: vi.fn(),
  tab: 0,
  setTab: vi.fn(),
};

describe('<HighlightToggle />', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    const { container } = render(
      <HighlightToggle elementsToHighlight={[nodeResult('#storybook-root')]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('should be checked when all targets are highlighted', () => {
    const { getByRole } = render(
      <A11yContext.Provider
        value={{
          ...defaultProviderValue,
          highlighted: ['#storybook-root'],
        }}
      >
        <HighlightToggle elementsToHighlight={[nodeResult('#storybook-root')]} />
      </A11yContext.Provider>
    );
    const checkbox = getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBeTruthy();
  });

  it('should be mixed when some targets are highlighted', () => {
    const { getByRole } = render(
      <A11yContext.Provider
        value={{
          ...defaultProviderValue,
          highlighted: ['#storybook-root'],
        }}
      >
        <HighlightToggle
          elementsToHighlight={[nodeResult('#storybook-root'), nodeResult('#storybook-root1')]}
        />
      </A11yContext.Provider>
    );
    const checkbox = getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBeTruthy();
  });

  describe('toggleHighlight', () => {
    afterEach(() => {
      cleanup();
    });

    it.each`
      highlighted            | elementsToHighlight                        | expected
      ${[]}                  | ${['#storybook-root']}                     | ${true}
      ${['#storybook-root']} | ${['#storybook-root']}                     | ${false}
      ${['#storybook-root']} | ${['#storybook-root', '#storybook-root1']} | ${true}
    `(
      'should be triggered with $expected when highlighted is $highlighted and elementsToHighlight is $elementsToHighlight',
      ({ highlighted, elementsToHighlight, expected }) => {
        const { getByRole } = render(
          <A11yContext.Provider
            value={{
              ...defaultProviderValue,
              highlighted,
            }}
          >
            <HighlightToggle elementsToHighlight={elementsToHighlight.map(nodeResult)} />
          </A11yContext.Provider>
        );
        const checkbox = getByRole('checkbox') as HTMLInputElement;
        fireEvent.click(checkbox);
        expect(defaultProviderValue.toggleHighlight).toHaveBeenCalledWith(
          elementsToHighlight,
          expected
        );
      }
    );
  });
});
