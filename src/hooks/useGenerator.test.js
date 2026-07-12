import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeneratorState } from './useGenerator';

function setup() {
  const showToast = vi.fn();
  const { result } = renderHook(() => useGeneratorState(showToast));
  return { result, showToast };
}

describe('useGeneratorState — step navigation & validation', () => {
  it('starts on the "about-you" step', () => {
    const { result } = setup();
    expect(result.current.currentStep).toBe('about-you');
  });

  it('blocks advancing past "about-you" when currentFocus is empty', () => {
    const { result, showToast } = setup();
    expect(result.current.canGoNext).toBe(false);

    act(() => result.current.goNext());

    // Should not have advanced
    expect(result.current.currentStep).toBe('about-you');
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('current focus'));
  });

  it('blocks advancing when currentFocus is only whitespace', () => {
    const { result } = setup();
    act(() => result.current.updateForm('currentFocus', '   '));
    expect(result.current.canGoNext).toBe(false);
  });

  it('allows advancing once currentFocus is filled in', () => {
    const { result } = setup();
    act(() => result.current.updateForm('currentFocus', 'Work has been stressful'));
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('mood-energy');
  });

  it('mood-energy step never blocks (always has default values)', () => {
    const { result } = setup();
    act(() => result.current.updateForm('currentFocus', 'test'));
    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('mood-energy');
    expect(result.current.canGoNext).toBe(true);
  });

  it('goBack moves to the previous step', () => {
    const { result } = setup();
    act(() => result.current.updateForm('currentFocus', 'test'));
    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('mood-energy');

    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe('about-you');
  });

  it('goBack does nothing on the first step', () => {
    const { result } = setup();
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe('about-you');
  });

  it('resetAll clears form data and returns to the first step', () => {
    const { result } = setup();
    act(() => result.current.updateForm('currentFocus', 'test'));
    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('mood-energy');

    act(() => result.current.resetAll());
    expect(result.current.currentStep).toBe('about-you');
    expect(result.current.formData.currentFocus).toBe('');
  });

  it('the full step sequence includes exactly the expected 10 steps', () => {
    const { result } = setup();
    expect(result.current.steps).toEqual([
      'about-you', 'mood-energy', 'coping-tools', 'goals', 'milestones',
      'gratitude', 'support-contacts', 'crisis-resources', 'custom', 'generate',
    ]);
  });
});
