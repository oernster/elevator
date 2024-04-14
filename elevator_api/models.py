from django.db import models

class Elevator(models.Model):
    floor = models.IntegerField()
    destinations = models.JSONField(default=list)

class ElevatorConfiguration(models.Model):
    elevator_id = models.IntegerField(primary_key=True)
    serviced_floors = models.JSONField(default=list)
