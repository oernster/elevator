# forms.py
from django import forms
from .models import ServicedFloor, ElevatorConfiguration, Elevator


class ServicedFloorForm(forms.ModelForm):
    class Meta:
        model = ServicedFloor
        fields = ['building', 'floor_number']


class ElevatorConfigurationForm(forms.ModelForm):
    class Meta:
        model = ElevatorConfiguration
        fields = ['elevator', 'serviced_floors']


class ElevatorForm(forms.ModelForm):
    class Meta:
        model = Elevator
        fields = ['floor', 'destinations']


