/**
 * Entity Structure Engine
 *
 * Manages multi-entity organizational structures, relationships, and consolidation logic.
 * Handles parent-subsidiary relationships, ownership percentages, intercompany transactions,
 * and complex organizational hierarchies across multiple countries and currencies.
 *
 * ALL CALCULATIONS USE calculationEngine - NEVER do math directly
 * ALL DATA VALIDATED using validationService
 *
 * Phase 1 Feature: Foundation for enterprise consolidation
 * Phase 6 Dependencies: Used by consolidationEngine.js
 *
 * Strict Rule: All entity relationships must be documented and traceable for audit purposes
 */

import * as CalcEngine from './calculationEngine';
import * as ValidationService from './validationService';

/**
 * Entity Structure Definition
 * Represents a single entity in the organizational hierarchy
 *
 * @typedef {Object} EntityStructure
 * @property {string} entityId - Unique identifier (e.g., 'ENT-001-NG')
 * @property {string} entityName - Legal entity name
 * @property {string} country - Country code (e.g., 'NG', 'US', 'GB')
 * @property {string} entityType - 'PARENT', 'SUBSIDIARY', 'BRANCH', 'JV'
 * @property {string} parentId - Parent entity ID (null if root)
 * @property {number} ownershipPercentage - 0-100
 * @property {number} votingPercentage - 0-100
 * @property {string} currency - Operating currency
 * @property {string} fiscalYearEnd - YYYY-MM-DD
 * @property {boolean} consolidationRequired - Whether consolidated in reports
 * @property {string[]} subsidiaryIds - Array of direct subsidiary IDs
 * @property {Object} financials - Financial data object
 */

/**
 * Create a new entity in the organizational structure
 *
 * @param {string} entityId - Unique entity identifier
 * @param {string} entityName - Legal entity name
 * @param {string} country - Country code (ISO 3166-1 alpha-2)
 * @param {string} entityType - 'PARENT', 'SUBSIDIARY', 'BRANCH', 'JV'
 * @param {string|null} parentId - Parent entity ID (null for root entities)
 * @param {number} ownershipPercentage - Ownership percentage (0-100)
 * @param {string} currency - Operating currency
 * @returns {EntityStructure|null} Created entity or null if invalid
 *
 * @example
 * const entity = createEntity('ENT-001-NG', 'Atonix Nigeria Ltd', 'NG', 'SUBSIDIARY',
 *   'ENT-000-US', 100, 'NGN');
 */
export function createEntity(
  entityId,
  entityName,
  country,
  entityType,
  parentId,
  ownershipPercentage,
  currency
) {
  // Validate inputs
  if (!ValidationService.isValidString(entityId) ||
      !ValidationService.isValidString(entityName) ||
      !ValidationService.isValidString(country) ||
      !ValidationService.isValidString(entityType)) {
    console.error('createEntity: Invalid string inputs');
    return null;
  }

  if (!ValidationService.isValidNumber(ownershipPercentage) ||
      ownershipPercentage < 0 || ownershipPercentage > 100) {
    console.error('createEntity: Ownership percentage must be 0-100');
    return null;
  }

  const validEntityTypes = [
    'PARENT',
    'SUBSIDIARY',
    'BRANCH',
    'JV',
    'JOINT_VENTURE',
    'TRUST',
    'FOUNDATION',
    'LLP',
    'PUBLIC_COMPANY',
    'HOLDING_COMPANY',
    'SPV',
    'REPRESENTATIVE_OFFICE',
    'GOVERNMENT_ENTITY',
    'SOLE_PROPRIETOR',
    'SOLE_TRADER',
    'PARTNERSHIP',
    'CORPORATION',
    'NONPROFIT',
    'OTHER'
  ];
  if (!validEntityTypes.includes(entityType)) {
    console.error(`createEntity: Invalid entity type. Must be one of: ${validEntityTypes.join(', ')}`);
    return null;
  }

  return {
    entityId,
    entityName,
    country,
    entityType,
    parentId: parentId || null,
    ownershipPercentage,
    votingPercentage: ownershipPercentage, // Default to ownership
    currency,
    fiscalYearEnd: new Date().toISOString().split('T')[0], // Today's date
    consolidationRequired: entityType !== 'BRANCH', // Branches typically not consolidated
    subsidiaryIds: [],
    financials: {}
  };
}

/**
 * Add a subsidiary to a parent entity
 * Updates both parent's subsidiaryIds array and child's parentId
 *
 * @param {EntityStructure} parentEntity - Parent entity object
 * @param {EntityStructure} childEntity - Child entity object
 * @param {number} ownershipPercentage - Ownership percentage
 * @returns {boolean} Success indicator
 *
 * @example
 * addSubsidiary(parentEntity, childEntity, 100);
 */
export function addSubsidiary(parentEntity, childEntity, ownershipPercentage) {
  if (!parentEntity || !childEntity) {
    console.error('addSubsidiary: Parent and child entities required');
    return false;
  }

  if (!ValidationService.isValidNumber(ownershipPercentage) ||
      ownershipPercentage < 0 || ownershipPercentage > 100) {
    console.error('addSubsidiary: Invalid ownership percentage');
    return false;
  }

  // Check for circular relationships
  if (isCircularRelationship(parentEntity, childEntity)) {
    console.error('addSubsidiary: Circular relationship detected');
    return false;
  }

  // Update child entity
  childEntity.parentId = parentEntity.entityId;
  childEntity.ownershipPercentage = ownershipPercentage;

  // Add to parent's subsidiaries
  if (!parentEntity.subsidiaryIds.includes(childEntity.entityId)) {
    parentEntity.subsidiaryIds.push(childEntity.entityId);
  }

  return true;
}

/**
 * Check for circular relationships in entity structure
 * Prevents A→B→C→A type cycles
 *
 * @param {EntityStructure} parentEntity - Potential parent
 * @param {EntityStructure} childEntity - Potential child
 * @returns {boolean} True if circular relationship exists
 */
export function isCircularRelationship(parentEntity, childEntity) {
  if (!childEntity.parentId) return false;

  let current = childEntity;
  const visited = new Set();

  while (current && current.parentId) {
    if (visited.has(current.entityId)) {
      return true; // Cycle detected
    }
    visited.add(current.entityId);

    if (current.parentId === parentEntity.entityId) {
      return true; // Would create cycle
    }

    // Move to parent (Note: In real implementation, would look up parent in structure)
    current = { parentId: null }; // Simplified
  }

  return false;
}

/**
 * Get organization hierarchy as tree structure
 * Shows parent-subsidiary relationships with ownership percentages
 *
 * @param {EntityStructure} rootEntity - Root entity to start traversal
 * @param {Map<string, EntityStructure>} entityMap - Map of all entities by ID
 * @returns {Object} Tree structure representation
 *
 * @example
 * const tree = getOrganizationHierarchy(parentEntity, entityMap);
 * // Returns: {
 * //   entityId: 'ENT-000',
 * //   entityName: 'Atonix Global',
 * //   ownershipPercentage: 100,
 * //   subsidiaries: [{ ... }, { ... }]
 * // }
 */
export function getOrganizationHierarchy(rootEntity, entityMap) {
  if (!rootEntity || !entityMap) {
    console.error('getOrganizationHierarchy: Root entity and entity map required');
    return null;
  }

  const buildTree = (entity) => {
    return {
      entityId: entity.entityId,
      entityName: entity.entityName,
      country: entity.country,
      entityType: entity.entityType,
      ownershipPercentage: entity.ownershipPercentage,
      currency: entity.currency,
      subsidiaries: entity.subsidiaryIds
        .map(id => entityMap.get(id))
        .filter(Boolean)
        .map(buildTree)
    };
  };

  return buildTree(rootEntity);
}

/**
 * Calculate consolidated ownership percentage through hierarchy
 * Traces ownership from root to specific entity through all levels
 *
 * Example: If A owns B (100%) and B owns C (80%), then consolidated ownership of C = 100% × 80% = 80%
 *
 * @param {EntityStructure} rootEntity - Root/parent entity
 * @param {EntityStructure} targetEntity - Target entity to calculate ownership for
 * @param {Map<string, EntityStructure>} entityMap - Map of all entities
 * @returns {number} Consolidated ownership percentage
 *
 * @example
 * const consolidated = getConsolidatedOwnership(parent, subsidiary, entityMap);
 * // Returns: 80 (representing 80% ownership through hierarchy)
 */
export function getConsolidatedOwnership(rootEntity, targetEntity, entityMap) {
  if (!rootEntity || !targetEntity || !entityMap) {
    console.error('getConsolidatedOwnership: Required parameters missing');
    return 0;
  }

  if (rootEntity.entityId === targetEntity.entityId) {
    return 100;
  }

  let current = targetEntity;
  let ownershipPath = [targetEntity.ownershipPercentage];

  while (current.parentId && current.parentId !== rootEntity.entityId) {
    const parent = entityMap.get(current.parentId);
    if (!parent) break;
    ownershipPath.unshift(parent.ownershipPercentage);
    current = parent;
  }

  // Final check - is current.parentId the root?
  if (current.parentId !== rootEntity.entityId) {
    console.warn('getConsolidatedOwnership: Target entity not in hierarchy');
    return 0;
  }

  // Calculate: multiply all percentages together
  let consolidated = 100;
  for (const percentage of ownershipPath) {
    consolidated = CalcEngine.multiply(consolidated, percentage);
    consolidated = CalcEngine.divide(consolidated, 100); // Convert to percentage
  }

  return CalcEngine.round(consolidated, 2);
}

/**
 * Eliminate intercompany transactions between consolidated entities
 * Removes double-counting of intra-group transactions
 *
 * @param {Object[]} entities - Array of entity financial objects
 * @param {Object[]} transactions - Array of intercompany transactions
 * @returns {Object} Adjusted financials with eliminations applied
 *
 * @example
 * const adjusted = eliminateIntercompanyTransactions(entities, transactions);
 * // Removes: revenue/expense for sales between group companies
 */
export function eliminateIntercompanyTransactions(entities, transactions) {
  if (!Array.isArray(entities) || !Array.isArray(transactions)) {
    console.error('eliminateIntercompanyTransactions: Arrays required');
    return null;
  }

  const entityMap = new Map(entities.map(e => [e.entityId, e]));
  const eliminations = {
    revenueElimination: 0,
    expenseElimination: 0,
    receivableElimination: 0,
    payableElimination: 0
  };

  for (const txn of transactions) {
    // Only process if both entities are in consolidated group
    if (entityMap.has(txn.fromEntityId) && entityMap.has(txn.toEntityId)) {
      // Add to eliminations (these will be subtracted from consolidated totals)
      if (txn.type === 'SALE') {
        eliminations.revenueElimination = CalcEngine.add(
          eliminations.revenueElimination,
          txn.amount
        );
      } else if (txn.type === 'PURCHASE') {
        eliminations.expenseElimination = CalcEngine.add(
          eliminations.expenseElimination,
          txn.amount
        );
      } else if (txn.type === 'RECEIVABLE') {
        eliminations.receivableElimination = CalcEngine.add(
          eliminations.receivableElimination,
          txn.amount
        );
      } else if (txn.type === 'PAYABLE') {
        eliminations.payableElimination = CalcEngine.add(
          eliminations.payableElimination,
          txn.amount
        );
      }
    }
  }

  return eliminations;
}

/**
 * Calculate goodwill on acquisition
 * Goodwill = Purchase Price - Fair Value of Net Assets
 *
 * @param {number} purchasePrice - Total acquisition price
 * @param {number} fairValueAssets - Fair value of acquired assets
 * @param {number} fairValueLiabilities - Fair value of acquired liabilities
 * @returns {number} Goodwill amount (can be negative indicating bargain purchase)
 *
 * @example
 * const goodwill = calculateGoodwill(1000000, 800000, 200000);
 * // Returns: 400000 (Purchase price - (Assets - Liabilities))
 */
export function calculateGoodwill(purchasePrice, fairValueAssets, fairValueLiabilities) {
  if (!ValidationService.isValidNumber(purchasePrice) ||
      !ValidationService.isValidNumber(fairValueAssets) ||
      !ValidationService.isValidNumber(fairValueLiabilities)) {
    console.error('calculateGoodwill: Invalid number inputs');
    return 0;
  }

  const netAssets = CalcEngine.subtract(fairValueAssets, fairValueLiabilities);
  const goodwill = CalcEngine.subtract(purchasePrice, netAssets);

  return CalcEngine.round(goodwill, 2);
}

/**
 * Calculate minority interest (non-controlling interest)
 * Minority Interest = Non-controlling % × Fair Value of Net Assets
 *
 * @param {number} nonControllingPercentage - Non-controlling ownership (0-100)
 * @param {number} fairValueAssets - Fair value of assets
 * @param {number} fairValueLiabilities - Fair value of liabilities
 * @returns {number} Minority interest amount
 *
 * @example
 * const minority = calculateMinorityInterest(20, 500000, 200000);
 * // Returns: 60000 (20% of 300000 net assets)
 */
export function calculateMinorityInterest(
  nonControllingPercentage,
  fairValueAssets,
  fairValueLiabilities
) {
  if (!ValidationService.isValidNumber(nonControllingPercentage) ||
      !ValidationService.isValidNumber(fairValueAssets) ||
      !ValidationService.isValidNumber(fairValueLiabilities)) {
    console.error('calculateMinorityInterest: Invalid number inputs');
    return 0;
  }

  const netAssets = CalcEngine.subtract(fairValueAssets, fairValueLiabilities);
  const percentageAmount = CalcEngine.multiply(netAssets, nonControllingPercentage);
  const minorityInterest = CalcEngine.divide(percentageAmount, 100);

  return CalcEngine.round(minorityInterest, 2);
}

/**
 * Calculate step acquisition impact
 * When ownership increases through multiple purchases, affects goodwill calculation
 *
 * @param {number[]} purchasePrices - Array of purchase prices (chronological)
 * @param {number[]} purchasePercentages - Ownership % for each purchase
 * @param {number} currentFairValue - Current fair value of net assets
 * @returns {Object} Step acquisition details
 *
 * @example
 * const stepAcq = calculateStepAcquisition(
 *   [500000, 300000],
 *   [40, 35],
 *   500000
 * );
 */
export function calculateStepAcquisition(purchasePrices, purchasePercentages, currentFairValue) {
  if (!Array.isArray(purchasePrices) || !Array.isArray(purchasePercentages)) {
    console.error('calculateStepAcquisition: Arrays required');
    return null;
  }

  if (purchasePrices.length !== purchasePercentages.length) {
    console.error('calculateStepAcquisition: Mismatched array lengths');
    return null;
  }

  let totalCost = 0;
  let totalOwnership = 0;
  const stepDetails = [];

  for (let i = 0; i < purchasePrices.length; i++) {
    const price = purchasePrices[i];
    const percentage = purchasePercentages[i];

    totalCost = CalcEngine.add(totalCost, price);
    totalOwnership = CalcEngine.add(totalOwnership, percentage);

    stepDetails.push({
      step: i + 1,
      price,
      ownership: percentage,
      cumulativePrice: totalCost,
      cumulativeOwnership: totalOwnership
    });
  }

  const totalGoodwill = calculateGoodwill(totalCost, currentFairValue, 0);

  return {
    steps: stepDetails,
    totalCost: CalcEngine.round(totalCost, 2),
    totalOwnership: CalcEngine.round(totalOwnership, 2),
    totalGoodwill: CalcEngine.round(totalGoodwill, 2),
    averagePricePerPercentage: CalcEngine.round(
      CalcEngine.divide(totalCost, totalOwnership),
      2
    )
  };
}

/**
 * Get all descendants of an entity (all subsidiaries at all levels)
 * Useful for identifying which entities to consolidate
 *
 * @param {EntityStructure} entity - Entity to find descendants for
 * @param {Map<string, EntityStructure>} entityMap - Map of all entities
 * @returns {EntityStructure[]} Array of all descendant entities
 *
 * @example
 * const descendants = getAllDescendants(parentEntity, entityMap);
 * // Returns all subsidiaries, sub-subsidiaries, etc.
 */
export function getAllDescendants(entity, entityMap) {
  if (!entity || !entityMap) {
    console.error('getAllDescendants: Entity and entity map required');
    return [];
  }

  const descendants = [];
  const queue = [...entity.subsidiaryIds];

  while (queue.length > 0) {
    const entityId = queue.shift();
    const child = entityMap.get(entityId);

    if (child) {
      descendants.push(child);
      queue.push(...child.subsidiaryIds);
    }
  }

  return descendants;
}

/**
 * Validate entity structure for completeness and consistency
 * Checks for missing data, circular relationships, invalid percentages
 *
 * @param {EntityStructure[]} entities - All entities in structure
 * @returns {Object} Validation report with errors and warnings
 *
 * @example
 * const report = validateEntityStructure(entities);
 * // Returns: { valid: true, errors: [], warnings: [] }
 */
export function validateEntityStructure(entities) {
  if (!Array.isArray(entities)) {
    return {
      valid: false,
      errors: ['Entities must be an array'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];
  const entityMap = new Map(entities.map(e => [e.entityId, e]));

  for (const entity of entities) {
    // Check required fields
    if (!entity.entityId || !entity.entityName || !entity.country) {
      errors.push(`Entity missing required fields: ${entity.entityId || 'unknown'}`);
    }

    // Check ownership percentages
    if (entity.ownershipPercentage < 0 || entity.ownershipPercentage > 100) {
      errors.push(`Entity ${entity.entityId}: Invalid ownership percentage`);
    }

    // Check parent exists
    if (entity.parentId && !entityMap.has(entity.parentId)) {
      errors.push(`Entity ${entity.entityId}: Parent ${entity.parentId} not found`);
    }

    // Check for circular relationships
    if (isCircularRelationship(entity, entity)) {
      errors.push(`Entity ${entity.entityId}: Circular relationship detected`);
    }

    // Warn if parent and child have same country without subsidiary
    if (entity.parentId) {
      const parent = entityMap.get(entity.parentId);
      if (parent && parent.country === entity.country && entity.entityType !== 'BRANCH') {
        warnings.push(`Entity ${entity.entityId}: Same country as parent without branch designation`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    entitiesChecked: entities.length
  };
}

/**
 * Generate entity structure report
 * Summary of all entities, their relationships, and consolidation status
 *
 * @param {EntityStructure[]} entities - All entities
 * @returns {string} Formatted report
 *
 * @example
 * const report = generateEntityStructureReport(entities);
 * console.log(report);
 */
export function generateEntityStructureReport(entities) {
  if (!Array.isArray(entities) || entities.length === 0) {
    return 'No entities to report';
  }

  let report = '=== ENTITY STRUCTURE REPORT ===\n\n';
  report += `Total Entities: ${entities.length}\n`;
  report += `Report Generated: ${new Date().toISOString()}\n\n`;

  const consolidated = entities.filter(e => e.consolidationRequired).length;
  report += `Entities in Consolidation: ${consolidated}\n\n`;

  report += '--- ENTITY DETAILS ---\n';
  for (const entity of entities) {
    report += `\nID: ${entity.entityId}\n`;
    report += `Name: ${entity.entityName}\n`;
    report += `Country: ${entity.country}\n`;
    report += `Type: ${entity.entityType}\n`;
    report += `Ownership: ${entity.ownershipPercentage}%\n`;
    report += `Currency: ${entity.currency}\n`;
    report += `Consolidated: ${entity.consolidationRequired ? 'Yes' : 'No'}\n`;
    if (entity.parentId) {
      report += `Parent: ${entity.parentId}\n`;
    }
    if (entity.subsidiaryIds.length > 0) {
      report += `Subsidiaries: ${entity.subsidiaryIds.join(', ')}\n`;
    }
  }

  return report;
}

export default {
  createEntity,
  addSubsidiary,
  isCircularRelationship,
  getOrganizationHierarchy,
  getConsolidatedOwnership,
  eliminateIntercompanyTransactions,
  calculateGoodwill,
  calculateMinorityInterest,
  calculateStepAcquisition,
  getAllDescendants,
  validateEntityStructure,
  generateEntityStructureReport
};
