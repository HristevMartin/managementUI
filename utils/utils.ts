
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidJSON(str: string): boolean {
  if (!str.trim()) return true; // Empty string is valid for our purposes
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function createConfigurationPayload(
  category: string,
  searchType: string,
  recommendation: boolean,
  selectedAttributes: any[],
  searchableAttributes: string[],
  searchableRelationFields: any[] = []
) {
  // Base payload structure
  const payload: any = {
    entityName: category,
    entitySearchType: searchType,
  };

  // Add recommendation only for searchEngine type
  if (searchType === 'searchEngine') {
    payload.recommendation = recommendation;
    payload.searchableFields = searchableAttributes;
    payload.searchableRelationFields = searchableRelationFields || [];
  }

  // Handle external search configuration
  if (searchType === 'external') {
    const externalEntityData = selectedAttributes.find(attr => attr.attribute === 'external');
    
    // Process headers and response parsers to ensure they have both key and value
    const validHeaders = externalEntityData?.headers?.filter(h => h.key && h.value) || [];
    const validParsers = externalEntityData?.responseParser?.filter(p => p.key && p.value) || [];
    
    // Prepare external metadata for the main entity
    payload.externalEntityMetaData = {
      ...externalEntityData,
      headers: validHeaders,
      responseParser: validParsers,
    };
    
    // Process attribute-specific external configurations
    const externalAttributesMetaData = selectedAttributes
      .filter(attr => attr.attribute !== 'external')
      .map(attr => ({
        attributeName: attr.attribute,
        externalUrl: attr.externalUrl || '',
        httpMethod: attr.httpMethod || '',
        headers: (attr.headers || []).filter(h => h.key && h.value),
        payload: attr.payload || '',
        responsePayload: attr.responsePayload || '',
        responseParser: (attr.responseParser || []).filter(p => p.key && p.value),
      }));
    
    payload.externalAttributesMetaData = externalAttributesMetaData;
  }
  
  return payload;
}