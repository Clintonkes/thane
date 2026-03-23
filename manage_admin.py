#!/usr/bin/env python3
"""
Admin Management Script for Thanesgaylerental
This script allows you to create, update, delete admin users and manage blocked IPs.

Usage:
    python manage_admin.py create -u username -p password -e email [-n "Full Name"]
    python manage_admin.py update -u username -p newpassword
    python manage_admin.py delete -u username
    python manage_admin.py list
    python manage_admin.py block -i IP_ADDRESS
    python manage_admin.py unblock -i IP_ADDRESS
    python manage_admin.py list-blocked
"""

import sys
import os
import argparse
import hashlib

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from database.connection import SessionLocal, init_db
from database.models import Admin, AdminSession, LoginAttempt

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_admin(username: str, password: str, email: str, full_name: str = None):
    """Create a new admin user"""
    init_db()
    db = SessionLocal()
    try:
        # Check if admin exists
        existing = db.query(Admin).filter(
            (Admin.username == username) | (Admin.email == email)
        ).first()
        
        if existing:
            print(f"Error: Admin with username '{username}' or email '{email}' already exists")
            return False
        
        # Create admin
        admin = Admin(
            username=username,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role="admin"
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✓ Admin created successfully!")
        print(f"  ID: {admin.id}")
        print(f"  Username: {admin.username}")
        print(f"  Email: {admin.email}")
        print(f"  Full Name: {admin.full_name or 'N/A'}")
        print(f"  Role: {admin.role}")
        return True
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def update_admin_password(username: str, new_password: str):
    """Update admin password"""
    init_db()
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == username).first()
        
        if not admin:
            print(f"Error: Admin '{username}' not found")
            return False
        
        admin.password_hash = hash_password(new_password)
        db.commit()
        
        print(f"✓ Password updated successfully for '{username}'")
        return True
        
    except Exception as e:
        print(f"Error updating password: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def delete_admin(username: str):
    """Delete an admin user"""
    init_db()
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == username).first()
        
        if not admin:
            print(f"Error: Admin '{username}' not found")
            return False
        
        # Delete associated sessions
        db.query(AdminSession).filter(AdminSession.admin_id == admin.id).delete()
        
        db.delete(admin)
        db.commit()
        
        print(f"✓ Admin '{username}' deleted successfully")
        return True
        
    except Exception as e:
        print(f"Error deleting admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_admins():
    """List all admin users"""
    init_db()
    db = SessionLocal()
    try:
        admins = db.query(Admin).all()
        
        if not admins:
            print("No admins found")
            return
        
        print(f"\n{'='*60}")
        print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Full Name':<20}")
        print(f"{'='*60}")
        
        for admin in admins:
            print(f"{admin.id:<5} {admin.username:<20} {admin.email:<30} {admin.full_name or 'N/A':<20}")
        
        print(f"{'='*60}")
        print(f"Total: {len(admins)} admin(s)")
        
    finally:
        db.close()

def block_ip(ip_address: str):
    """Block an IP address"""
    init_db()
    db = SessionLocal()
    try:
        # Check if already blocked
        existing = db.query(LoginAttempt).filter(
            LoginAttempt.ip_address == ip_address,
            LoginAttempt.is_blocked == True
        ).first()
        
        if existing:
            print(f"IP '{ip_address}' is already blocked")
            return True
        
        # Create a blocked entry
        attempt = LoginAttempt(
            ip_address=ip_address,
            username="BLOCKED",
            success=False,
            is_blocked=True
        )
        
        db.add(attempt)
        db.commit()
        
        print(f"✓ IP '{ip_address}' has been blocked")
        return True
        
    except Exception as e:
        print(f"Error blocking IP: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def unblock_ip(ip_address: str):
    """Unblock an IP address"""
    init_db()
    db = SessionLocal()
    try:
        # Find and update blocked entries
        blocked = db.query(LoginAttempt).filter(
            LoginAttempt.ip_address == ip_address,
            LoginAttempt.is_blocked == True
        ).all()
        
        if not blocked:
            print(f"IP '{ip_address}' is not blocked")
            return True
        
        for entry in blocked:
            entry.is_blocked = False
        
        db.commit()
        print(f"✓ IP '{ip_address}' has been unblocked")
        return True
        
    except Exception as e:
        print(f"Error unblocking IP: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_blocked_ips():
    """List all blocked IP addresses"""
    init_db()
    db = SessionLocal()
    try:
        blocked = db.query(LoginAttempt).filter(
            LoginAttempt.is_blocked == True
        ).all()
        
        if not blocked:
            print("No blocked IPs found")
            return
        
        print(f"\n{'='*40}")
        print(f"{'Blocked IP Addresses':^40}")
        print(f"{'='*40}")
        
        for entry in blocked:
            print(f"  {entry.ip_address}")
        
        print(f"{'='*40}")
        print(f"Total: {len(blocked)} blocked IP(s)")
        
    finally:
        db.close()

def clear_failed_attempts(username: str = None):
    """Clear failed login attempts for a user or all users"""
    init_db()
    db = SessionLocal()
    try:
        if username:
            count = db.query(LoginAttempt).filter(
                LoginAttempt.username == username,
                LoginAttempt.success == False,
                LoginAttempt.is_blocked == False
            ).delete()
            db.commit()
            print(f"✓ Cleared {count} failed attempt(s) for '{username}'")
        else:
            count = db.query(LoginAttempt).filter(
                LoginAttempt.success == False,
                LoginAttempt.is_blocked == False
            ).delete()
            db.commit()
            print(f"✓ Cleared {count} failed attempt(s) for all users")
        
    except Exception as e:
        print(f"Error clearing attempts: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Admin Management Script")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Create admin
    create_parser = subparsers.add_parser("create", help="Create a new admin")
    create_parser.add_argument("-u", "--username", required=True, help="Username")
    create_parser.add_argument("-p", "--password", required=True, help="Password")
    create_parser.add_argument("-e", "--email", required=True, help="Email")
    create_parser.add_argument("-n", "--name", help="Full Name")
    
    # Update password
    update_parser = subparsers.add_parser("update", help="Update admin password")
    update_parser.add_argument("-u", "--username", required=True, help="Username")
    update_parser.add_argument("-p", "--password", required=True, help="New Password")
    
    # Delete admin
    delete_parser = subparsers.add_parser("delete", help="Delete an admin")
    delete_parser.add_argument("-u", "--username", required=True, help="Username")
    
    # List admins
    subparsers.add_parser("list", help="List all admins")
    
    # Block IP
    block_parser = subparsers.add_parser("block", help="Block an IP address")
    block_parser.add_argument("-i", "--ip", required=True, help="IP Address")
    
    # Unblock IP
    unblock_parser = subparsers.add_parser("unblock", help="Unblock an IP address")
    unblock_parser.add_argument("-i", "--ip", required=True, help="IP Address")
    
    # List blocked IPs
    subparsers.add_parser("list-blocked", help="List blocked IP addresses")
    
    # Clear failed attempts
    clear_parser = subparsers.add_parser("clear-attempts", help="Clear failed login attempts")
    clear_parser.add_argument("-u", "--username", help="Username (optional, clears all if not specified)")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == "create":
        create_admin(args.username, args.password, args.email, args.name)
    elif args.command == "update":
        update_admin_password(args.username, args.password)
    elif args.command == "delete":
        delete_admin(args.username)
    elif args.command == "list":
        list_admins()
    elif args.command == "block":
        block_ip(args.ip)
    elif args.command == "unblock":
        unblock_ip(args.ip)
    elif args.command == "list-blocked":
        list_blocked_ips()
    elif args.command == "clear-attempts":
        clear_failed_attempts(args.username)

if __name__ == "__main__":
    main()
