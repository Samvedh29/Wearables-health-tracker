import uuid
from app.database import SessionLocal
from app.models.developer import Developer
from app.models.user import User

def seed_personal_user():
    db = SessionLocal()
    try:
        # Get the first developer (admin)
        developer = db.query(Developer).first()
        if not developer:
            print("No developer found. Please run seed_admin first.")
            return

        # Check if user already exists
        user = db.query(User).filter(User.external_user_id == "me").first()
        if user:
            print(f"Personal user already exists with ID: {user.id}")
            return

        # Create personal user
        user = User(
            id=uuid.uuid4(),
            external_user_id="me",
            first_name="My",
            last_name="Profile",
            email=developer.email
        )
        db.add(user)
        db.commit()
        print(f"Created personal user with ID: {user.id}")
    except Exception as e:
        print(f"Error seeding personal user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_personal_user()
