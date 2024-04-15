# forms.py
from django import forms
from .models import ServicedFloor, ElevatorConfiguration


class ServicedFloorForm(forms.ModelForm):
    class Meta:
        model = ServicedFloor
        fields = ['building', 'floor_number']


class ElevatorConfigurationForm(forms.ModelForm):
    class Meta:
        model = ElevatorConfiguration
        fields = ['elevator', 'serviced_floors']
