# Security Specification (Payload-First TDD Design)

This document maps data invariants, specifies "The Dirty Dozen" malicious payloads, and outlines firestore security rule verification.

## 1. Data Invariants
1. **Unapproved Admin Restraint**: Users requesting to be branch administrators must be initialized with status `Pending`. They cannot auto-approve themselves to `Active`.
2. **Patient PII Integrity**: Patients may register using their own verified accounts. No patient configuration details (PII) can be scanned/read by unauthorized third-party unauthenticated clients.
3. **Unique Branch Identity (Constraint)**: No duplicate branch admin registrations with the same Email or Phone number.
4. **Audit Logs Immutability**: No edits or deletions are permitted on the compliance `auditLogs` collection once stored.

---

## 2. The "Dirty Dozen" Malicious Payloads (Unauthorized Writes)

Here are the 12 attack vectors representing invalid schema states, identity spoofing, and permission bypasses:

### Payload 1: Self-Approved Admin Privilege Escalation
An applicant attempts to set status immediately to `Active`.
* **Resource**: `/databases/$(database)/documents/branchAdmins/attacker_id`
* **JSON**: `{ "name": "Hack Admin", "email": "hack@medcore.com", "phone": "111-222", "status": "Active" }`
* **Result**: `PERMISSION_DENIED` (status must be `Pending` on creation)

### Payload 2: Hostile Administrative Hijack
Attacker tries to de-authorize an active admin profile.
* **Resource**: `/databases/$(database)/documents/branchAdmins/adm-1`
* **Request Authed**: Unauthenticated or not Super Admin.
* **JSON**: `{ "status": "De-authorized" }`
* **Result**: `PERMISSION_DENIED`

### Payload 3: Email Identity Spoofing
Attacker tries to register as another corporate executive email with their own UID.
* **Resource**: `/databases/$(database)/documents/branchAdmins/my_uid`
* **JSON**: `{ "name": "Imposter", "email": "j.miller@mayo.org" }`
* **Result**: `PERMISSION_DENIED`

### Payload 4: Overwriting Clinical Bed Patient Information
Attacker outside nursing staff tries to assign a patient to a bed.
* **Resource**: `/databases/$(database)/documents/beds/bed-1`
* **JSON**: `{ "patientId": "pat-hacked", "patientName": "Interloper" }`
* **Result**: `PERMISSION_DENIED`

### Payload 5: Arbitrary Doctor Rating Injection
A patient attempts to inject earnings metrics adjustments to a physician.
* **Resource**: `/databases/$(database)/documents/doctors/doc-1`
* **JSON**: `{ "earnings": 9999999 }`
* **Result**: `PERMISSION_DENIED`

### Payload 6: Altering Sibling Diagnostic Results (Tampering)
A regular client tries to update another patient's completed lab results.
* **Resource**: `/databases/$(database)/documents/labOrders/lab-1`
* **JSON**: `{ "result": "Normal" }`
* **Result**: `PERMISSION_DENIED`

### Payload 7: Deleting Compliance Audit Footprints
An attacker tries to purge audit records to clear clinical evidence.
* **Resource**: `/databases/$(database)/documents/auditLogs/aud-1`
* **Action**: `delete`
* **Result**: `PERMISSION_DENIED` (Audit Logs are read-only)

### Payload 8: Hijacking Patient Personal Information
Anonymous read on patient list.
* **Resource**: `/databases/$(database)/documents/patients/pat-1`
* **Action**: Read without valid verified authentication scope.
* **Result**: `PERMISSION_DENIED`

### Payload 9: Forging Hospital Certification Tier
A branch admin attempts to upgrade their Hospital enterprise subscription package tier.
* **Resource**: `/databases/$(database)/documents/hospitals/hosp-2`
* **JSON**: `{ "tier": "Enterprise" }`
* **Result**: `PERMISSION_DENIED`

### Payload 10: Unauthorized Appointment Interception
Unauthorized user cancels a diagnostic slot scheduled by another patient.
* **Resource**: `/databases/$(database)/documents/appointments/apt-1`
* **JSON**: `{ "status": "Cancelled" }`
* **Result**: `PERMISSION_DENIED`

### Payload 11: Patient Billing Adjustment
An outpatient tries to clear their outstanding balance manually by marking invoice as `Paid`.
* **Resource**: `/databases/$(database)/documents/invoices/inv-2`
* **JSON**: `{ "status": "Paid" }`
* **Result**: `PERMISSION_DENIED`

### Payload 12: Injection of Massive ID string
Attempting "Denial of Wallet" resource attack by creating an ID with a huge nested string.
* **ID variable**: `very_long_string_with_more_than_128_characters`
* **Result**: `PERMISSION_DENIED` (Guard regex & string size blocks this)
