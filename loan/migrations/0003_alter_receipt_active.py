# Generated by Django 4.2 on 2023-05-17 19:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loan', '0002_payment_created_by_payment_updated_by_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='receipt',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
