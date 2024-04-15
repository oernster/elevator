from django.contrib import admin

from .models import Elevator, Building, ServicedFloor, ElevatorConfiguration
from .forms import ServicedFloorForm, ElevatorConfigurationForm

class ServicedFloorAdmin(admin.ModelAdmin):
    form = ServicedFloorForm

class BuildingAdmin(admin.ModelAdmin):
    pass

class ElevatorAdmin(admin.ModelAdmin):
    pass

class ElevatorConfigurationAdmin(admin.ModelAdmin):
    form = ElevatorConfigurationForm

admin.site.register(Elevator, ElevatorAdmin)
admin.site.register(Building, BuildingAdmin)
admin.site.register(ServicedFloor, ServicedFloorAdmin)
admin.site.register(ElevatorConfiguration, ElevatorConfigurationAdmin)