from rest_framework import serializers
from .models import Elevator, ElevatorConfiguration


class ElevatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elevator
        fields = '__all__'


class ElevatorConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElevatorConfiguration
        fields = '__all__'


class ElevatorStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elevator
        fields = ['id', 'floor', 'destinations']
