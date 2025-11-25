import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sdkModules } from './customModules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const apiDocPath = join(__dirname, 'cms-api-docs.json');

let cachedDoc = null;

export function loadApiDoc() {
  if (!cachedDoc) {
    const content = readFileSync(apiDocPath, 'utf-8');
    const parsedDoc = JSON.parse(content);
    cachedDoc = mergeCustomModules(parsedDoc);
  }
  return cachedDoc;
}

function mergeCustomModules(doc) {
  const result = { ...doc };
  const modules = Array.isArray(result.modules) ? [...result.modules] : [];
  const moduleMap = new Map(modules.map((module) => [module.id, module]));

  sdkModules.forEach((customModule) => {
    if (!moduleMap.has(customModule.id)) {
      modules.push(customModule);
      moduleMap.set(customModule.id, customModule);
      return;
    }

    const existingModule = moduleMap.get(customModule.id);
    // 合并描述与标签
    if (!existingModule.description && customModule.description) {
      existingModule.description = customModule.description;
    }
    const mergedTags = new Set([
      ...(existingModule.tags || []),
      ...(customModule.tags || []),
    ]);
    existingModule.tags = Array.from(mergedTags);

    // 合并接口
    const existingEndpoints = existingModule.endpoints || [];
    const endpointMap = new Map(existingEndpoints.map((endpoint) => [endpoint.id, endpoint]));
    (customModule.endpoints || []).forEach((endpoint) => {
      if (!endpointMap.has(endpoint.id)) {
        existingEndpoints.push(endpoint);
        endpointMap.set(endpoint.id, endpoint);
      }
    });
    existingModule.endpoints = existingEndpoints;
  });

  result.modules = modules;
  return result;
}

export function getModules() {
  const doc = loadApiDoc();
  return doc.modules || [];
}

export function getModuleById(moduleId) {
  return getModules().find((m) => m.id === moduleId);
}

export function getEndpoint(moduleId, endpointId) {
  const module = getModuleById(moduleId);
  if (!module) return null;
  return module.endpoints?.find((e) => e.id === endpointId);
}

