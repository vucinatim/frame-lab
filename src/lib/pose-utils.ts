import { Skeleton, Joint } from "./pose-data";

/**
 * Calculates the absolute rotation of a joint by recursively summing the relative
 * rotations of its ancestors up to the root.
 * @param jointId - The ID of the joint to calculate the rotation for.
 * @param jointsById - A map of joint IDs to joint objects for efficient lookup.
 * @returns The absolute rotation in radians.
 */
export const getAbsoluteRotation = (
  jointId: string,
  jointsById: Record<string, Joint>
): number => {
  const joint = jointsById[jointId];
  if (!joint) return 0;
  if (!joint.parentId) return joint.rotation;
  return joint.rotation + getAbsoluteRotation(joint.parentId, jointsById);
};

/**
 * Recursively updates the x and y positions of all descendants of a given joint.
 * This function performs a forward kinematics update.
 * @param parentId - The ID of the parent joint to start the update from.
 * @param skeleton - The skeleton to update.
 * @param jointsById - A map of joint IDs to joint objects for efficient lookup.
 */
export const updateChildrenPositions = (
  parentId: string,
  skeleton: Skeleton,
  jointsById: Record<string, Joint>
): void => {
  const parentJoint = jointsById[parentId];
  if (!parentJoint) return;

  const children = skeleton.filter((j) => j.parentId === parentId);

  children.forEach((child) => {
    const childAbsRotation = getAbsoluteRotation(child.id, jointsById);
    child.x = parentJoint.x + Math.cos(childAbsRotation) * child.length;
    child.y = parentJoint.y + Math.sin(childAbsRotation) * child.length;
    updateChildrenPositions(child.id, skeleton, jointsById);
  });
};
