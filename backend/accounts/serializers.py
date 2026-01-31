from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'phone_number', 
                  'state', 'city', 'password', 'password2')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                  'phone_number', 'state', 'city', 'date_joined', 'is_superuser', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_superuser', 'is_staff')
