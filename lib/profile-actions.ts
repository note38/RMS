"use server";

import * as profileController from "@/lib/controllers/profile-controller";

export async function updateUserProfile(formData: FormData) {
  return profileController.updateUserProfile(formData);
}

export async function updateAccountProfile(formData: FormData) {
  return profileController.updateAccountProfile(formData);
}
