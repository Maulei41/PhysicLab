/**
 * Module Registry
 * Maps module IDs to their components
 */

import GayLussacLaw from '../modules/GayLussacLaw';
import PlaceholderModule from '../modules/PlaceholderModule';

import BoylesLaw from '../modules/BoylesLaw';

export const modules = [
  {
    id: 'gay-lussac',
    title: "Gay-Lussac's Law",
    component: GayLussacLaw,
  },
  {
    id: 'module-2',
    title: 'Boyle\'s Law',
    component: BoylesLaw,
  },
  {
    id: 'module-3',
    title: 'Charles\'s Law',
    component: PlaceholderModule,
  },
  {
    id: 'module-4',
    title: 'Ideal Gas Law',
    component: PlaceholderModule,
  },
];

export const getModuleById = (id) => {
  return modules.find(module => module.id === id) || null;
};
