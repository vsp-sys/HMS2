/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, 
  onSnapshot, orderBy, query, limit, deleteDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, isPlaceholder } from './firebase';

// Helper to check and seed database collections dynamically
export async function seedDatabaseIfEmpty(initialDataMap) {
  if (isPlaceholder) {
    console.log("seedDatabaseIfEmpty: Placeholder configuration detected, skipping seed database cloud operations.");
    return;
  }
  console.log("Validating database initialization states...");
  for (const [colName, initialItems] of Object.entries(initialDataMap)) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(query(colRef, limit(1)));
      if (snapshot.empty && initialItems && initialItems.length > 0) {
        console.log(`Seeding metadata & initial items for collection: ${colName}`);
        for (const item of initialItems) {
          // Keep identical original string IDs to preserve clinical relational references
          const docId = item.id || `${colName.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const payload = { ...item };
          // If the item doesn't have id, attach it
          if (!payload.id) {
            payload.id = docId;
          }
          await setDoc(doc(db, colName, docId), payload);
        }
      }
    } catch (error) {
      console.warn(`Seeding skipped for ${colName} (might be permission locked in rule or already set):`, error.message);
    }
  }
  console.log("Database checks completed.");
}

// -------------------------------------------------------------
// Real-time Database Snapshot Listeners Subscribes
// -------------------------------------------------------------
export function setupRealtimeListeners(stateSetters) {
  if (isPlaceholder) {
    console.log("setupRealtimeListeners: Placeholder configuration detected, skipping live cloud DB subscription listeners.");
    return () => {};
  }

  const unsubscribes = [];

  const collectionsMapping = {
    hospitals: stateSetters.setHospitals,
    branches: stateSetters.setBranches,
    beds: stateSetters.setBeds,
    doctors: stateSetters.setDoctors,
    patients: stateSetters.setPatients,
    appointments: stateSetters.setAppointments,
    prescriptions: stateSetters.setPrescriptions,
    invoices: stateSetters.setInvoices,
    labOrders: stateSetters.setLabOrders,
    tickets: stateSetters.setTickets,
    vitals: stateSetters.setVitals,
    fluids: stateSetters.setFluids,
    medications: stateSetters.setMedications,
    handoffs: stateSetters.setHandoffs,
    branchAdmins: stateSetters.setBranchAdmins,
    inventory: stateSetters.setInventoryItems,
    auditLogs: stateSetters.setAuditLogs,
    notifications: stateSetters.setNotifications,
    licenses: stateSetters.setLicenses,
  };

  for (const [colName, setter] of Object.entries(collectionsMapping)) {
    if (!setter) continue;
    
    // Audit logs & notifications sorted by newest timestamp or ID as fallback
    let q = collection(db, colName);
    if (colName === 'auditLogs' || colName === 'notifications') {
      q = query(collection(db, colName), orderBy('timestamp', 'desc'));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() });
      });
      setter(docs);
    }, (error) => {
      // Gracefully catch standard read errors conforming to firestore-integration requirement
      handleFirestoreError(error, OperationType.GET, colName);
    });

    unsubscribes.push(unsub);
  }

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}

// -------------------------------------------------------------
// Real-time Automated Mutations wrapped with Exception guards
// -------------------------------------------------------------

export async function addHospitalSync(newHosp) {
  const path = 'hospitals';
  const createdId = newHosp.id || `hosp-${Date.now()}`;
  const payload = {
    ...newHosp,
    id: createdId,
    branchesCount: Number(newHosp.branchesCount || 0),
    joinedDate: newHosp.joinedDate || new Date().toISOString().split('T')[0]
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleHospitalStateSync(hospId, currentStatus) {
  if (isPlaceholder) return;
  const path = 'hospitals';
  try {
    await updateDoc(doc(db, path, hospId), {
      isActive: !currentStatus
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${hospId}`);
  }
}

export async function addBranchSync(newBranch) {
  const path = 'branches';
  const createdId = newBranch.id || `br-${Date.now()}`;
  const payload = {
    ...newBranch,
    id: createdId,
    bedsOccupied: 0,
    bedsAvailable: Number(newBranch.bedsTotal || 2),
    staffCount: 1,
    activeDoctorsCount: 0
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);

    // Increase hospital branchesCount
    try {
      const hospRef = doc(db, 'hospitals', newBranch.hospitalId);
      await updateDoc(hospRef, {
        branchesCount: Number(newBranch.branchesCount || 0) + 1
      });
    } catch (_) {
      // In case hospital doc write is blocked
    }

    // Default beds
    await setDoc(doc(db, 'beds', `bed-${Date.now()}-1`), {
      id: `bed-${Date.now()}-1`,
      branchId: createdId,
      wardName: 'General Intensive ICU',
      bedNumber: 'Bed-01 (ICU)',
      status: 'Unoccupied'
    });
    await setDoc(doc(db, 'beds', `bed-${Date.now()}-2`), {
      id: `bed-${Date.now()}-2`,
      branchId: createdId,
      wardName: 'General Ward',
      bedNumber: 'Bed-02 (Gen)',
      status: 'Unoccupied'
    });

    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function resolveTicketSync(ticketId) {
  if (isPlaceholder) return;
  const path = 'tickets';
  try {
    await updateDoc(doc(db, path, ticketId), {
      status: 'Resolved'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${ticketId}`);
  }
}

export async function addBranchAdminSync(newAdmin) {
  const path = 'branchAdmins';
  const createdId = newAdmin.id || `adm-${Date.now()}`;
  const payload = {
    ...newAdmin,
    id: createdId
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleBranchAdminStatusSync(adminId, currentStatus) {
  if (isPlaceholder) return;
  const path = 'branchAdmins';
  try {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await updateDoc(doc(db, path, adminId), {
      status: nextStatus
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${adminId}`);
  }
}

export async function deleteBranchAdminSync(adminId) {
  if (isPlaceholder) return;
  const path = 'branchAdmins';
  try {
    await deleteDoc(doc(db, path, adminId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${adminId}`);
  }
}

export async function dischargePatientSync(patientId) {
  if (isPlaceholder) return;
  const path = 'patients';
  try {
    await updateDoc(doc(db, path, patientId), {
      status: 'Discharged'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${patientId}`);
  }
}

export async function restockMedicineSync(itemId, currentQty, amount) {
  if (isPlaceholder) return;
  const path = 'inventory';
  try {
    await updateDoc(doc(db, path, itemId), {
      quantity: Number(currentQty) + Number(amount)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${itemId}`);
  }
}

export async function dispensePharmacySync(itemId, currentQty, amount) {
  if (isPlaceholder) return;
  const path = 'inventory';
  try {
    await updateDoc(doc(db, path, itemId), {
      quantity: Math.max(0, Number(currentQty || 0) - Number(amount))
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${itemId}`);
  }
}

export async function updateLabStatusSync(labId, status, result) {
  if (isPlaceholder) return;
  const path = 'labOrders';
  try {
    await updateDoc(doc(db, path, labId), {
      status,
      result: result || ''
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${labId}`);
  }
}

export async function addDoctorSync(newDoc) {
  const path = 'doctors';
  const createdId = newDoc.id || `doc-${Date.now()}`;
  const payload = {
    ...newDoc,
    id: createdId,
    rating: Number(newDoc.rating || 5.0),
    earnings: Number(newDoc.earnings || 250)
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addPatientSync(newPat) {
  const path = 'patients';
  const createdId = newPat.id || `pat-${Date.now()}`;
  const payload = {
    ...newPat,
    id: createdId,
    registeredDate: newPat.registeredDate || new Date().toISOString().split('T')[0]
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function setBedTimerSync(bedId, duration, endsAt) {
  if (isPlaceholder) return;
  const path = 'beds';
  try {
    await updateDoc(doc(db, path, bedId), {
      timerDuration: duration || null,
      timerEndsAt: endsAt || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${bedId}`);
  }
}

export async function updateBedStatusSync(bedId, status, patientId, patientName) {
  if (isPlaceholder) return;
  const path = 'beds';
  try {
    await updateDoc(doc(db, path, bedId), {
      status,
      patientId: patientId || null,
      patientName: patientName || null,
      timerDuration: null,
      timerEndsAt: null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${bedId}`);
  }
}

export async function addBedSync(newBed) {
  const path = 'beds';
  const createdId = newBed.id || `bed-${Date.now()}`;
  const payload = {
    ...newBed,
    id: createdId
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addInvoiceSync(newInv) {
  const path = 'invoices';
  const createdId = newInv.id || `inv-${Date.now()}`;
  const payload = {
    ...newInv,
    id: createdId
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function reconcileInvoiceSync(invoiceId, status) {
  if (isPlaceholder) return;
  const path = 'invoices';
  try {
    await updateDoc(doc(db, path, invoiceId), {
      status
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${invoiceId}`);
  }
}

export async function logVitalsSync(vData, bClass) {
  const path = 'vitals';
  const createdId = `v-${Date.now()}`;
  const payload = {
    ...vData,
    id: createdId,
    recordedAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    classification: bClass
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function logFluidSync(fData) {
  const path = 'fluids';
  const createdId = `f-${Date.now()}`;
  const payload = {
    ...fData,
    id: createdId,
    recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleMedStateSync(medId, nextStatus, timeSign) {
  if (isPlaceholder) return;
  const path = 'medications';
  try {
    await updateDoc(doc(db, path, medId), {
      status: nextStatus,
      administeredAt: timeSign || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${medId}`);
  }
}

export async function addHandoffSync(created) {
  if (isPlaceholder) return;
  const path = 'handoffs';
  try {
    await setDoc(doc(db, path, created.id), created);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addPrescriptionSync(newPresc) {
  const path = 'prescriptions';
  const createdId = `pr-${Date.now()}`;
  const payload = {
    ...newPresc,
    id: createdId,
    date: new Date().toISOString().split('T')[0]
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAppointmentStatusSync(aptId, status) {
  if (isPlaceholder) return;
  const path = 'appointments';
  try {
    await updateDoc(doc(db, path, aptId), {
      status
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${aptId}`);
  }
}

export async function bookAppointmentSync(newApt) {
  const path = 'appointments';
  const createdId = `apt-${Date.now()}`;
  const payload = {
    ...newApt,
    id: createdId,
    status: 'Scheduled'
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function appendAuditLogSync(freshLog) {
  if (isPlaceholder) return;
  const path = 'auditLogs';
  try {
    await setDoc(doc(db, path, freshLog.id), freshLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addNotificationSync(newNotif) {
  const path = 'notifications';
  const createdId = newNotif.id || `notif-${Date.now()}`;
  const payload = {
    ...newNotif,
    id: createdId,
    timestamp: newNotif.timestamp || new Date().toISOString()
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addLicenseSync(newLicense) {
  const path = 'licenses';
  const createdId = `lic-${Date.now()}`;
  const payload = {
    ...newLicense,
    id: createdId
  };

  if (isPlaceholder) {
    return payload;
  }

  try {
    await setDoc(doc(db, path, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLicenseSync(licId, updatedFields) {
  if (isPlaceholder) return;
  const path = 'licenses';
  try {
    await updateDoc(doc(db, path, licId), updatedFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${licId}`);
  }
}

export async function deleteLicenseSync(licId) {
  if (isPlaceholder) return;
  const path = 'licenses';
  try {
    await deleteDoc(doc(db, path, licId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${licId}`);
  }
}

export async function deleteNotificationSync(notifId) {
  if (isPlaceholder) return;
  const path = 'notifications';
  try {
    await deleteDoc(doc(db, path, notifId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${notifId}`);
  }
}

export async function wipeAllCollectionsSync() {
  if (isPlaceholder) return;
  const collectionsList = [
    'hospitals', 'branches', 'beds', 'doctors', 'patients', 
    'appointments', 'prescriptions', 'invoices', 'labOrders', 
    'tickets', 'vitals', 'fluids', 'medications', 'handoffs', 
    'branchAdmins', 'inventory', 'auditLogs', 'notifications',
    'licenses'
  ];

  for (const colName of collectionsList) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
      console.log(`Purged collection in cloud: ${colName}`);
    } catch (error) {
      console.warn(`Could not clear firestore collection: ${colName}`, error.message);
    }
  }
}

export async function genericCreateSync(collectionName, createdId, payload) {
  if (isPlaceholder) return payload;
  try {
    await setDoc(doc(db, collectionName, createdId), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

export async function genericUpdateSync(collectionName, itemId, updatedFields) {
  if (isPlaceholder) return;
  try {
    await updateDoc(doc(db, collectionName, itemId), updatedFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${itemId}`);
  }
}

export async function genericDeleteSync(collectionName, itemId) {
  if (isPlaceholder) return;
  try {
    await deleteDoc(doc(db, collectionName, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${itemId}`);
  }
}

