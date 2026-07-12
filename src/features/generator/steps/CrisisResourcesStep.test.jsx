import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../app/providers/ThemeProvider';
import CrisisResourcesStep from './CrisisResourcesStep';
import { CRISIS_RESOURCES } from '../../../constants/crisisResources';

function renderWithTheme(ui) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('CrisisResourcesStep', () => {
  it('renders every crisis resource by name', () => {
    renderWithTheme(<CrisisResourcesStep />);
    for (const resource of CRISIS_RESOURCES) {
      // Match on a short prefix to avoid line-wrapping/whitespace issues,
      // and escape any regex-special characters in the resource name.
      const prefix = resource.name.slice(0, 15).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(screen.getByText(new RegExp(prefix))).toBeInTheDocument();
    }
  });

  it('renders the "not a substitute for professional care" disclaimer', () => {
    renderWithTheme(<CrisisResourcesStep />);
    expect(screen.getByText(/not a substitute for professional mental health care/i)).toBeInTheDocument();
  });

  it('clearly states this is not a crisis service itself', () => {
    renderWithTheme(<CrisisResourcesStep />);
    expect(screen.getByText(/not a crisis service/i)).toBeInTheDocument();
  });

  it('renders with no required props (always safe to mount)', () => {
    expect(() => renderWithTheme(<CrisisResourcesStep />)).not.toThrow();
  });
});
