/**
 * Test utilities with providers
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { I18nProvider } from '@/modules/ui/i18n';

/**
 * Custom render function that wraps components with necessary providers
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

type CustomRenderResult = Omit<RenderResult, 'rerender'> & {
  rerender: (ui: ReactNode) => void;
};

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): CustomRenderResult {
  const result = render(ui, { wrapper: AllProviders, ...options });

  return {
    ...result,
    // Override rerender to also use the wrapper
    rerender: (newUi: ReactNode) => {
      result.rerender(<AllProviders>{newUi}</AllProviders>);
    },
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
