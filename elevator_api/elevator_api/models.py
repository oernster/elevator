from django.db import models


class Elevator(models.Model):
    floor = models.IntegerField()
    destinations = models.JSONField(default=list)


class ElevatorConfiguration(models.Model):
    elevator = models.OneToOneField(Elevator, on_delete=models.CASCADE, primary_key=True)
    serviced_floors = models.JSONField(default=list)


class Building(models.Model):
    name = models.CharField(max_length=100)


class ServicedFloor(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    floor_number = models.IntegerField()

    def __str__(self):
        return f"{self.building.name} - Floor {self.floor_number}"
