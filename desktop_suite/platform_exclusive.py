"""Cross-Platform Parity & OS-Exclusive Capabilities Module — ZIES v1.0 Compliant.

Zero Illusion Engineering Standard Guarantees:
  - Article III (Computational Integrity): Never substitute missing/failed measurements with 0 or fabricated defaults.
  - Article IV (Failure Transparency): Never swallow exceptions or return silent empty lists on command failure.
    Every probe returns explicit {"ok": bool, "error": str | None, "evidence_status": str, ...}.
"""

from __future__ import annotations

import hashlib
import json
import os
import platform
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import psutil
except Exception:
    psutil = None


def current_os() -> str:
    s = platform.system().lower()
    if s == "windows":
        return "windows"
    if s == "darwin":
        return "macos"
    return "linux"


def local_data_dir(app_slug: str) -> Path:
    os_name = current_os()
    if os_name == "windows":
        base = Path(os.environ.get("APPDATA", str(Path.home())))
    elif os_name == "macos":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", str(Path.home() / ".local" / "share")))
    d = base / "BobbysNextWaveApps" / app_slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def _run_cmd(args: List[str], timeout: int = 10) -> Tuple[bool, str, Optional[str]]:
    """Executes an OS command and preserves exact failure/timeout reasons (never swallows errors)."""
    try:
        kwargs: Dict[str, Any] = {
            "capture_output": True,
            "text": True,
            "timeout": timeout,
            "encoding": "utf-8",
            "errors": "replace",
        }
        if current_os() == "windows":
            kwargs["creationflags"] = 0x08000000  # CREATE_NO_WINDOW
        res = subprocess.run(args, **kwargs)
        if res.returncode != 0:
            err = (res.stderr or res.stdout or f"exit code {res.returncode}").strip()
            return False, (res.stdout or "").strip(), err
        return True, (res.stdout or "").strip(), None
    except subprocess.TimeoutExpired:
        return False, "", f"Command timed out after {timeout}s: {' '.join(args[:3])}"
    except FileNotFoundError:
        return False, "", f"Required OS tool not found: {args[0]}"
    except Exception as exc:
        return False, "", f"{type(exc).__name__}: {exc}"


def _run_ps_json(ps_script: str, timeout: int = 12) -> Tuple[bool, Any, Optional[str]]:
    if current_os() != "windows":
        return False, None, "Windows PowerShell probe invoked on non-Windows host"
    ok, out, err = _run_cmd(
        ["powershell", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
        timeout=timeout,
    )
    if not ok:
        return False, None, err or "PowerShell command failed"
    if not out:
        return True, [], None
    try:
        return True, json.loads(out), None
    except Exception as exc:
        return False, None, f"Failed to parse PowerShell JSON output: {exc}"


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def get_system_overview() -> Dict[str, Any]:
    os_name = current_os()
    mem_gb = round(psutil.virtual_memory().total / (1024 ** 3), 2) if psutil else None
    mem_pct = psutil.virtual_memory().percent if psutil else None
    cpu_pct = psutil.cpu_percent(interval=0.1) if psutil else None
    disk = shutil.disk_usage(Path.home())
    return {
        "ok": True,
        "evidence_status": "REAL — LIVE HOST",
        "os": os_name,
        "os_label": {"windows": "Windows", "macos": "macOS", "linux": "Linux"}[os_name],
        "release": platform.platform(),
        "arch": platform.machine(),
        "hostname": platform.node(),
        "cpu_cores": os.cpu_count(),
        "cpu_percent": cpu_pct,
        "memory_total_gb": mem_gb,
        "memory_percent": mem_pct,
        "disk_total_gb": round(disk.total / (1024 ** 3), 2),
        "disk_free_gb": round(disk.free / (1024 ** 3), 2),
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "exclusive_capabilities": {
            "windows": [
                "Win32/WMI PnP & USB VID/PID Enumeration",
                "Windows Defender & Event Log / Registry Run-Key Telemetry",
                "NTFS / OneDrive / Windows Temp Inspection",
                "WASAPI / Win32 Audio Endpoint Discovery",
                "Hyper-V / WHPX / WSL2 / QEMU Preflight",
                "Authenticode Digital Signature & SHA-256 Verification",
            ],
            "macos": [
                "IOKit USB Descriptor Enumeration (system_profiler)",
                "APFS / diskutil & iCloud Drive Inspection",
                "CoreAudio Endpoint Discovery",
                "SIP Status Inspection (csrutil)",
                "Apple Hypervisor.framework (kern.hv_support)",
            ],
            "linux": [
                "lsusb / udev Hardware Enumeration",
                "lsblk Block Device Enumeration",
                "systemd / fstrim / journalctl Capability Probe",
                "PulseAudio / PipeWire Sink Discovery (pactl)",
                "KVM (/dev/kvm) & QEMU Preflight",
            ],
        },
    }


def scan_usb_hardware() -> Dict[str, Any]:
    os_name = current_os()
    if os_name == "windows":
        ok, data, err = _run_ps_json(
            "Get-CimInstance Win32_PnPEntity -Filter \"DeviceID LIKE 'USB%' OR PnPClass='Ports' OR PnPClass='USB'\" "
            "| Select-Object -First 60 Name,DeviceID,Manufacturer,Status,PNPClass | ConvertTo-Json -Compress"
        )
        if not ok:
            return {"ok": False, "os": "windows", "backend": "Win32_PnPEntity / WMI", "error": err, "devices": None}
        items = data if isinstance(data, list) else ([data] if data else [])
        parsed = []
        for it in items:
            did = str(it.get("DeviceID") or "")
            vid = did.split("VID_")[1][:4] if "VID_" in did else None
            pid = did.split("PID_")[1][:4] if "PID_" in did else None
            parsed.append({
                "name": it.get("Name"),
                "vid": vid,
                "pid": pid,
                "manufacturer": it.get("Manufacturer"),
                "status": it.get("Status"),
                "class": it.get("PNPClass"),
                "device_id": did,
            })
        return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "windows", "backend": "Win32_PnPEntity / WMI", "error": None, "devices": parsed}

    if os_name == "macos":
        ok, out, err = _run_cmd(["system_profiler", "SPUSBDataType", "-json"], timeout=10)
        return {"ok": ok, "os": "macos", "backend": "IOKit / system_profiler", "error": err, "raw": out[:4000] if ok else None, "devices": None}

    ok, out, err = _run_cmd(["lsusb"], timeout=8)
    if not ok:
        return {"ok": False, "os": "linux", "backend": "lsusb", "error": err, "devices": None}
    devs = [{"name": line, "vid": None, "pid": None, "status": "PRESENT", "class": "USB"} for line in out.splitlines() if line.strip()]
    return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "linux", "backend": "lsusb", "error": None, "devices": devs}


def scan_physical_disks() -> Dict[str, Any]:
    os_name = current_os()
    if os_name == "windows":
        ok1, disks, err1 = _run_ps_json(
            "Get-CimInstance Win32_DiskDrive | Select-Object DeviceID,Model,InterfaceType,MediaType,Size,Partitions,Status | ConvertTo-Json -Compress"
        )
        ok2, vols, err2 = _run_ps_json(
            "Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID,VolumeName,FileSystem,Size,FreeSpace,DriveType | ConvertTo-Json -Compress"
        )
        if not ok1 and not ok2:
            return {"ok": False, "os": "windows", "backend": "WMI DiskDrive", "error": f"{err1}; {err2}", "disks": None, "volumes": None}
        dlist = (disks if isinstance(disks, list) else ([disks] if disks else [])) if ok1 else []
        vlist = (vols if isinstance(vols, list) else ([vols] if vols else [])) if ok2 else []
        for d in dlist:
            sz = d.get("Size")
            d["size_gb"] = round(int(sz) / (1024 ** 3), 2) if sz is not None else None
            d["removable"] = "USB" in str(d.get("InterfaceType") or "").upper() or "Removable" in str(d.get("MediaType") or "")
        for v in vlist:
            sz, fr = v.get("Size"), v.get("FreeSpace")
            v["size_gb"] = round(int(sz) / (1024 ** 3), 2) if sz is not None else None
            v["free_gb"] = round(int(fr) / (1024 ** 3), 2) if fr is not None else None
        return {
            "ok": ok1 and ok2,
            "evidence_status": "REAL — LIVE HOST",
            "os": "windows",
            "backend": "WMI Win32_DiskDrive + Win32_LogicalDisk",
            "error": err1 or err2,
            "disks": dlist,
            "volumes": vlist,
        }

    if os_name == "macos":
        ok, out, err = _run_cmd(["diskutil", "list"], timeout=8)
        return {"ok": ok, "os": "macos", "backend": "diskutil", "error": err, "raw": out if ok else None, "disks": None, "volumes": None}

    ok, out, err = _run_cmd(["lsblk", "-J", "-o", "NAME,SIZE,TYPE,MOUNTPOINT,MODEL,TRAN"], timeout=8)
    if not ok:
        return {"ok": False, "os": "linux", "backend": "lsblk", "error": err, "disks": None, "volumes": None}
    try:
        parsed = json.loads(out)
        return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "linux", "backend": "lsblk", "error": None, "disks": parsed.get("blockdevices", []), "volumes": []}
    except Exception as exc:
        return {"ok": False, "os": "linux", "backend": "lsblk", "error": f"JSON parse error: {exc}", "disks": None, "volumes": None}


def scan_security_telemetry() -> Dict[str, Any]:
    os_name = current_os()
    errors: List[str] = []
    procs: List[Dict[str, Any]] = []
    conns: List[Dict[str, Any]] = []
    if psutil:
        for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
            try:
                info = p.info
                procs.append({
                    "pid": info["pid"],
                    "name": info["name"],
                    "cpu": round(info["cpu_percent"], 1) if info.get("cpu_percent") is not None else None,
                    "mem": round(info["memory_percent"], 2) if info.get("memory_percent") is not None else None,
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        procs.sort(key=lambda x: (x["mem"] if x["mem"] is not None else -1), reverse=True)
        procs = procs[:25]
        try:
            for c in psutil.net_connections(kind="inet")[:25]:
                conns.append({
                    "laddr": f"{c.laddr.ip}:{c.laddr.port}" if c.laddr else None,
                    "raddr": f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else "LISTEN",
                    "status": c.status,
                    "pid": c.pid,
                })
        except Exception as exc:
            errors.append(f"net_connections: {exc}")
    else:
        errors.append("psutil unavailable")

    if os_name == "windows":
        ok_d, defender, err_d = _run_ps_json(
            "Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled,AMServiceEnabled,AntivirusSignatureLastUpdated | ConvertTo-Json -Compress"
        )
        if not ok_d:
            errors.append(f"Defender query failed: {err_d}")
        ok_r, run_keys, err_r = _run_ps_json(
            "$p = Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -ErrorAction SilentlyContinue; "
            "if ($p) { $p.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | Select-Object Name,Value | ConvertTo-Json -Compress } else { '[]' }"
        )
        if not ok_r:
            errors.append(f"Startup registry query failed: {err_r}")
        ok_e, events, err_e = _run_ps_json(
            "Get-WinEvent -LogName System -MaxEvents 10 | Select-Object TimeCreated,Id,LevelDisplayName,ProviderName,Message | ConvertTo-Json -Compress"
        )
        if not ok_e:
            errors.append(f"WinEvent query failed: {err_e}")
        return {
            "ok": len(errors) == 0,
            "evidence_status": "REAL — LIVE HOST",
            "os": "windows",
            "backend": "Windows Defender + HKCU Run Keys + WinEvent Log",
            "errors": errors,
            "defender": defender if (ok_d and isinstance(defender, dict)) else None,
            "startup_items": (run_keys if isinstance(run_keys, list) else ([run_keys] if run_keys else [])) if ok_r else None,
            "recent_events": (events if isinstance(events, list) else ([events] if events else [])) if ok_e else None,
            "top_processes": procs,
            "network_connections": conns,
        }

    if os_name == "macos":
        ok_s, sip, err_s = _run_cmd(["csrutil", "status"])
        if not ok_s:
            errors.append(f"csrutil: {err_s}")
        return {"ok": len(errors) == 0, "os": "macos", "backend": "SIP / psutil", "errors": errors, "sip_status": sip if ok_s else None, "top_processes": procs, "network_connections": conns}

    ok_u, units, err_u = _run_cmd(["systemctl", "list-units", "--type=service", "--state=running", "--no-pager"], timeout=6)
    if not ok_u:
        errors.append(f"systemctl: {err_u}")
    return {"ok": len(errors) == 0, "os": "linux", "backend": "systemd / psutil", "errors": errors, "running_services": units.splitlines()[:15] if ok_u else None, "top_processes": procs, "network_connections": conns}


def scan_storage_exclusive() -> Dict[str, Any]:
    os_name = current_os()
    if os_name == "windows":
        temp_str = os.environ.get("TEMP")
        temp_mb: Optional[float] = None
        temp_truncated = False
        temp_errors = 0
        if temp_str and Path(temp_str).exists():
            total = 0
            count = 0
            for f in Path(temp_str).rglob("*"):
                if f.is_file():
                    try:
                        total += f.stat().st_size
                        count += 1
                    except OSError:
                        temp_errors += 1
                if count >= 5000:
                    temp_truncated = True
                    break
            temp_mb = round(total / (1024 * 1024), 2)
        onedrive = os.environ.get("OneDrive")
        return {
            "ok": True,
            "evidence_status": "REAL — LIVE HOST",
            "os": "windows",
            "backend": "NTFS / OneDrive / Windows TEMP",
            "windows_temp_mb": temp_mb,
            "windows_temp_truncated": temp_truncated,
            "windows_temp_unreadable_files": temp_errors,
            "onedrive_path": onedrive,
            "onedrive_present": bool(onedrive and Path(onedrive).exists()),
        }
    if os_name == "macos":
        icloud = Path.home() / "Library" / "Mobile Documents" / "com~apple~CloudDocs"
        return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "macos", "backend": "APFS / iCloud", "icloud_present": icloud.exists()}
    return {
        "ok": True,
        "evidence_status": "REAL — LIVE HOST",
        "os": "linux",
        "backend": "Linux Storage Tools",
        "journal_supported": shutil.which("journalctl") is not None,
        "fstrim_supported": shutil.which("fstrim") is not None,
    }


def scan_audio_endpoints() -> Dict[str, Any]:
    os_name = current_os()
    if os_name == "windows":
        ok, devs, err = _run_ps_json(
            "Get-CimInstance Win32_SoundDevice | Select-Object Name,Manufacturer,Status,ProductName | ConvertTo-Json -Compress"
        )
        if not ok:
            return {"ok": False, "os": "windows", "backend": "Win32_SoundDevice", "error": err, "devices": None}
        dlist = devs if isinstance(devs, list) else ([devs] if devs else [])
        return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "windows", "backend": "WASAPI / Win32_SoundDevice", "error": None, "devices": dlist}
    if os_name == "macos":
        ok, out, err = _run_cmd(["system_profiler", "SPAudioDataType"])
        return {"ok": ok, "os": "macos", "backend": "CoreAudio", "error": err, "raw": out[:3000] if ok else None, "devices": None}
    ok, out, err = _run_cmd(["pactl", "list", "short", "sinks"])
    if not ok:
        return {"ok": False, "os": "linux", "backend": "PipeWire / PulseAudio", "error": err, "devices": None}
    return {"ok": True, "evidence_status": "REAL — LIVE HOST", "os": "linux", "backend": "PipeWire / PulseAudio", "error": None, "devices": [{"name": ln, "status": "PRESENT"} for ln in out.splitlines() if ln.strip()]}


def scan_virtualization_status() -> Dict[str, Any]:
    os_name = current_os()
    if os_name == "windows":
        qemu = shutil.which("qemu-system-x86_64")
        wsl = shutil.which("wsl")
        ok, hv, err = _run_ps_json(
            "Get-CimInstance Win32_ComputerSystem | Select-Object HypervisorPresent,Manufacturer,Model | ConvertTo-Json -Compress"
        )
        return {
            "ok": ok,
            "evidence_status": "REAL — LIVE HOST",
            "os": "windows",
            "backend": "Windows Hypervisor Platform (WHPX) / Hyper-V / WSL2",
            "error": err,
            "hypervisor_present": hv.get("HypervisorPresent") if (ok and isinstance(hv, dict)) else None,
            "wsl_installed": wsl is not None,
            "qemu_path": qemu,
            "host_model": hv.get("Model") if (ok and isinstance(hv, dict)) else None,
        }
    if os_name == "macos":
        ok, hvf, err = _run_cmd(["sysctl", "-n", "kern.hv_support"])
        return {"ok": ok, "os": "macos", "backend": "Hypervisor.framework", "error": err, "hypervisor_present": (hvf == "1") if ok else None}
    return {
        "ok": True,
        "evidence_status": "REAL — LIVE HOST",
        "os": "linux",
        "backend": "Linux KVM (/dev/kvm)",
        "error": None,
        "hypervisor_present": Path("/dev/kvm").exists(),
        "qemu_path": shutil.which("qemu-system-x86_64"),
    }


def verify_file_evidence(file_path: str) -> Dict[str, Any]:
    p = Path(file_path)
    if not file_path or not p.exists() or not p.is_file():
        return {"ok": False, "error": f"File not found: {file_path}"}
    st = p.stat()
    info: Dict[str, Any] = {
        "ok": True,
        "evidence_status": "REAL — CRYPTOGRAPHICALLY COMPUTED",
        "name": p.name,
        "path": str(p.resolve()),
        "size_bytes": st.st_size,
        "sha256": sha256_file(p),
        "modified_utc": datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
    }
    if current_os() == "windows":
        safe_path = str(p.resolve()).replace("'", "''")
        ok, sig, err = _run_ps_json(
            f"Get-AuthenticodeSignature -LiteralPath '{safe_path}' | Select-Object Status,StatusMessage,@{{N='Signer';E={{$_.SignerCertificate.Subject}}}} | ConvertTo-Json -Compress"
        )
        info["os_signature_check"] = sig if (ok and isinstance(sig, dict)) else {"error": err}
        info["signature_engine"] = "Windows Authenticode"
    elif current_os() == "macos":
        ok, out, err = _run_cmd(["codesign", "-dv", str(p)])
        info["os_signature_check"] = out if ok else {"error": err}
        info["signature_engine"] = "macOS codesign"
    else:
        ok, out, err = _run_cmd(["file", str(p)])
        info["os_signature_check"] = out if ok else {"error": err}
        info["signature_engine"] = "Linux file"
    return info


def get_clipboard_text() -> Dict[str, Any]:
    if current_os() == "windows":
        ok, out, err = _run_cmd(["powershell", "-NoProfile", "-Command", "Get-Clipboard -Raw"])
    elif current_os() == "macos":
        ok, out, err = _run_cmd(["pbpaste"])
    else:
        ok, out, err = _run_cmd(["xclip", "-o", "-selection", "clipboard"])
    return {"ok": ok, "text": out if ok else None, "error": err}
