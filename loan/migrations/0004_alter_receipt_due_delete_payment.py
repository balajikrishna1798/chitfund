# Generated by Django 4.2 on 2023-05-20 09:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loan', '0003_alter_receipt_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='receipt',
            name='due',
            field=models.ManyToManyField(to='loan.due'),
        ),
        migrations.DeleteModel(
            name='payment',
        ),
    ]
